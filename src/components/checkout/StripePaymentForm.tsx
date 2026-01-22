import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
    onSuccess: () => void;
    onBack: () => void;
    amount: number;
    baseAmount: number;
    paymentMethod: string;
    clientSecret: string;
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
    amount,
    baseAmount,
    paymentMethod,
    submitLabel,
    billingDetails,
    clientSecret
}: StripePaymentFormProps & { submitLabel?: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [boletoUrl, setBoletoUrl] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        if (event) event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const confirmParams: any = {
                return_url: `${window.location.origin}/pedidos`,
                payment_method_data: {
                    billing_details: billingDetails,
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
                if (paymentIntent.status === 'succeeded') {
                    toast.success("Pagamento aprovado!");
                    onSuccess();
                } else if (paymentIntent.status === 'requires_action') {
                    const nextAction = (paymentIntent as any).next_action;
                    if (nextAction?.type === 'boleto_display_details') {
                        setBoletoUrl(nextAction.boleto_display_details.hosted_voucher_url);
                        toast.info("Boleto gerado com sucesso!");
                    } else if (nextAction?.redirect_to_url) {
                        window.location.href = nextAction.redirect_to_url.url;
                    }
                } else {
                    onSuccess();
                }
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Erro inesperado.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 border rounded-xl shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-green-600" /> Ambiente Seguro Stripe
                </h3>

                {!boletoUrl ? (
                    <div className="animate-in fade-in">
                        <PaymentElement
                            options={{
                                layout: 'accordion',
                                fields: {
                                    billingDetails: {
                                        address: {
                                            country: 'never'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="text-center py-4 animate-in zoom-in-95">
                        <div className="space-y-4">
                            <h4 className="font-bold border-b pb-2 mb-4">Boleto Bancário Gerado</h4>
                            <p className="text-sm text-muted-foreground">Seu boleto foi gerado. Clique no botão abaixo para abrir o documento e realizar o pagamento.</p>
                            <Button asChild className="w-full h-12 text-base font-bold">
                                <a href={boletoUrl} target="_blank" rel="noopener noreferrer">
                                    Abrir Boleto Bancário
                                </a>
                            </Button>
                            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">
                                O pagamento pode levar até 3 dias úteis para compensar.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {errorMessage && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMessage}</div>}

            <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={isProcessing}>Voltar</Button>
                <Button type="button" onClick={handleSubmit} className="btn-primary flex-[2]" disabled={!stripe || isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : (boletoUrl ? 'Concluir Pedido' : 'Confirmar e Pagar')}
                </Button>
            </div>
        </div>
    );
};
