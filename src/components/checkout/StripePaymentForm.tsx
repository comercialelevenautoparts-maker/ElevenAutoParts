import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
    onSuccess: (orderId: string) => void;
    onBack: () => void;
    amount: number;
    baseAmount: number;
    paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto' | 'card';
    clientSecret: string;
    isSummaryStep?: boolean;
    onNextStep?: () => void;
    onCreateOrder: (status: string) => Promise<any>;
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
            const confirmParams: any = {
                return_url: `${window.location.origin}/pedidos`,
                payment_method_data: {
                    billing_details: sanitizedBillingDetails,
                }
            };

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams,
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || "Erro no pagamento");
                toast.error(error.message);
            } else if (paymentIntent) {
                let orderStatus = 'pendente';
                if (paymentIntent.status === 'succeeded') {
                    orderStatus = 'pago';
                }

                const order = await onCreateOrder(orderStatus);

                if (paymentIntent.status === 'succeeded') {
                    toast.success("Pagamento aprovado!");
                    onSuccess(order.id);
                } else if (paymentIntent.status === 'requires_action') {
                    const nextAction = (paymentIntent as any).next_action;
                    if (nextAction?.type === 'boleto_display_details') {
                        setBoletoUrl(nextAction.boleto_display_details.hosted_voucher_url);
                        toast.info("Boleto gerado com sucesso!");
                    } else if (nextAction?.redirect_to_url) {
                        window.location.href = nextAction.redirect_to_url.url;
                    }
                } else {
                    onSuccess(order.id);
                }
            }
        } catch (err: any) {
            console.error("Payment submission error:", err);
            setErrorMessage(err.message || "Erro inesperado.");
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

    if (boletoUrl) {
        return (
            <div className="space-y-6">
                <div className="bg-white p-6 border rounded-xl shadow-sm border-green-200">
                    <div className="text-center py-4 animate-in zoom-in-95">
                        <div className="space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                            </div>
                            <h4 className="font-bold border-b pb-2 mb-4 text-xl text-green-800">Pedido Realizado!</h4>
                            <p className="text-sm text-muted-foreground italic">Seu pedido foi registrado com sucesso. Efetue o pagamento do boleto para processarmos o envio.</p>

                            <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-3">
                                <Button asChild className="w-full h-12 text-base font-bold btn-primary">
                                    <a href={boletoUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="w-5 h-5 mr-2" /> Abrir Boleto Bancário
                                    </a>
                                </Button>
                                <Button variant="outline" onClick={() => window.location.href = '/pedidos'} className="w-full">
                                    Ver Meus Pedidos
                                </Button>
                            </div>

                            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest bg-muted/20 py-2 rounded">
                                O pagamento pode levar até 3 dias úteis para compensar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="flex gap-3">
                    <Button type="button" variant="outline" className="w-40 border-primary text-primary hover:bg-primary/5" onClick={onBack}>
                        Voltar
                    </Button>
                </div>
            )}
        </div>
    );
};
