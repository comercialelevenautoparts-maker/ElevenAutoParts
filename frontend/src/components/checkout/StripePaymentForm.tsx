import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, FileText, CheckCircle2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
    onSuccess: (orderId: string, data: { type: 'card' | 'boleto' | 'pix', boletoUrl?: string }) => void;
    onBack: () => void;
    amount: number;
    baseAmount: number;
    paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto' | 'card';
    clientSecret: string;
    isSummaryStep?: boolean;
    onNextStep?: () => void;
    onCreateOrder: (status: string, paymentMethod?: string) => Promise<any>;
    onPaymentMethodChange?: (type: string) => void;
    onCompleteChange?: (complete: boolean) => void;
    onRegisterSubmit?: (submitFn: () => Promise<void>) => void;
    billingDetails?: {
        name: string;
        email: string;
        phone: string;
        address: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        }
    };
}

export const StripePaymentForm = ({
    onSuccess,
    onBack,
    paymentMethod,
    submitLabel,
    billingDetails,
    clientSecret,
    isSummaryStep = false,
    onNextStep,
    onCreateOrder,
    onPaymentMethodChange,
    onCompleteChange,
    onRegisterSubmit
}: StripePaymentFormProps & { submitLabel?: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Register submit function with parent
    useEffect(() => {
        if (onRegisterSubmit) {
            onRegisterSubmit(handleSubmit);
        }
    }, [stripe, elements, billingDetails]);

    // Sanitize billing details to avoid 'undefined' values that cause trim() errors in Stripe JS
    const sanitizedBillingDetails = useMemo(() => ({
        name: (billingDetails?.name || 'Cliente').trim(),
        email: (billingDetails?.email || '').trim(),
        phone: (billingDetails?.phone || '').trim(),
        address: {
            line1: (billingDetails?.address?.line1 || '').trim(),
            city: (billingDetails?.address?.city || '').trim(),
            state: (billingDetails?.address?.state || '').trim(),
            postal_code: (billingDetails?.address?.postal_code || '').trim(),
            country: 'BR',
        }
    }), [billingDetails]);

    const handleSubmit = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // 1. Submit the elements first
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message || "Erro na validação.");
                setIsProcessing(false);
                return;
            }

            // 2. Create the Payment Method
            const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
                elements,
                params: {
                    billing_details: sanitizedBillingDetails,
                }
            });

            if (pmError) {
                setErrorMessage(pmError.message || "Erro ao processar dados de pagamento.");
                setIsProcessing(false);
                return;
            }

            // 3. Confirm payment on the BACKEND to avoid Stripe.js automatic modal
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const paymentIntentId = clientSecret.split('_secret_')[0];

            const response = await fetch(`${apiUrl}/api/confirm-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentIntentId,
                    paymentMethodId: pm.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha na confirmação do pagamento');
            }

            const { paymentIntent } = await response.json();

            // 4. Handle based on status and identify correct method
            let orderStatus = 'pendente';
            let finalPaymentMethod = pm.type; // Default to what Stripe identified

            if (paymentIntent.status === 'succeeded') {
                orderStatus = 'pago';
            }

            // Refine payment method based on actual intent result
            if (paymentIntent.next_action?.type === 'boleto_display_details') {
                finalPaymentMethod = 'boleto';
            } else if (paymentIntent.next_action?.type === 'pix_display_qr_code') {
                finalPaymentMethod = 'pix';
            }

            const order = await onCreateOrder(orderStatus, finalPaymentMethod);

            // Vincula o PaymentIntent ao Order ID para permitir webhooks futuros (ex: boleto pago)
            if (paymentIntentId && order.id) {
                try {
                    console.log('🔗 Vinculando pedido ao pagamento...');
                    await fetch(`${apiUrl}/api/update-payment-intent`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentIntentId,
                            orderId: order.id
                        }),
                    });
                } catch (linkError) {
                    console.error('⚠️ Falha ao vincular metadata, mas pedido criado:', linkError);
                    // Não bloqueia o fluxo, pois o pedido já foi criado
                }
            }

            if (paymentIntent.status === 'succeeded') {
                toast.success("Pagamento aprovado!");
                onSuccess(order.id, { type: finalPaymentMethod as any });
            } else if (paymentIntent.status === 'requires_action') {
                const nextAction = paymentIntent.next_action;

                if (nextAction?.type === 'boleto_display_details') {
                    const url = nextAction.boleto_display_details.hosted_voucher_url;
                    onSuccess(order.id, { type: 'boleto', boletoUrl: url });
                } else if (nextAction?.type === 'pix_display_qr_code') {
                    onSuccess(order.id, { type: 'pix' });
                } else if (nextAction?.redirect_to_url || nextAction?.type === 'use_stripe_sdk') {
                    const { error: handleActionError, paymentIntent: handledIntent } = await stripe.handleNextAction({
                        clientSecret,
                    });

                    if (handleActionError) {
                        toast.error(handleActionError.message);
                    } else {
                        onSuccess(order.id, { type: 'card' });
                    }
                }
            } else {
                onSuccess(order.id, { type: 'card' });
            }
        } catch (err: any) {
            console.error("Payment submission error:", err);
            setErrorMessage(err.message || "Erro inesperado.");
            toast.error(err.message || "Erro ao processar pagamento.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = () => {
        if (!isComplete) {
            toast.error("Por favor, preencha todos os campos de pagamento.");
            return;
        }
        if (onNextStep) onNextStep();
    };



    return (
        <div className={isSummaryStep ? "" : "space-y-6"}>
            <div
                style={isSummaryStep ? {
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: 0,
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    borderWidth: '0',
                } : {}}
                className={`bg-white p-6 border rounded-xl shadow-sm transition-all duration-300 ${!isSummaryStep ? 'opacity-100 h-auto' : ''}`}
            >
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-green-600" /> Ambiente Seguro Stripe
                </h3>
                {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMessage}</div>}
                <div className="animate-in fade-in">
                    <PaymentElement
                        onChange={(event) => {
                            setIsComplete(event.complete);
                            if (onCompleteChange) onCompleteChange(event.complete);
                            if (onPaymentMethodChange && event.value.type) {
                                onPaymentMethodChange(event.value.type);
                            }
                        }}
                        options={{
                            layout: 'accordion',
                            fields: {
                                billingDetails: { address: { country: 'never' } }
                            }
                        }}
                    />
                </div>
            </div>

            {!isSummaryStep && (
                <div className="hidden md:flex gap-3">
                    <Button type="button" variant="outline" className="w-40 border-primary text-primary hover:bg-primary/5" onClick={onBack}>
                        Voltar
                    </Button>
                </div>
            )}
        </div>
    );
};


