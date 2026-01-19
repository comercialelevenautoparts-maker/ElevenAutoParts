import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Copy, CheckCircle2, FileText, QrCode as QrIcon, Info } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
    onSuccess: () => void;
    onBack: () => void;
    amount: number;
    baseAmount: number;
    paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
    installments: number;
    setInstallments: (n: number) => void;
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
    installments,
    setInstallments,
    submitLabel,
    billingDetails,
    clientSecret
}: StripePaymentFormProps & { submitLabel?: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pixData, setPixData] = useState<{ qr_code_url: string, qr_code_base64?: string, copy_paste: string } | null>(null);
    const [boletoUrl, setBoletoUrl] = useState<string | null>(null);

    // CPF for Pix/Boleto (since we hide PaymentElement)
    const [cpf, setCpf] = useState("");

    // Interest Logic
    const INTEREST_RATE = 0.0299;
    const MAX_FREE_INSTALLMENTS = 3;

    const calculateOptionTotal = (n: number) => {
        if (n <= MAX_FREE_INSTALLMENTS) return baseAmount;
        return baseAmount * (1 + (INTEREST_RATE * n));
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        if (event) event.preventDefault();

        if (!stripe) return;

        // Validation for Card
        if ((paymentMethod === 'credit' || paymentMethod === 'debit') && !elements) {
            return;
        }

        // Validation for Pix/Boleto (CPF is required in Brazil)
        if ((paymentMethod === 'pix' || paymentMethod === 'boleto') && cpf.replace(/\D/g, '').length < 11) {
            toast.error("Por favor, informe um CPF válido para continuar.");
            setErrorMessage("CPF inválido.");
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const confirmParams: any = {
                return_url: `${window.location.origin}/pedidos`,
            };

            if (billingDetails) {
                confirmParams.payment_method_data = {
                    billing_details: {
                        ...billingDetails,
                        // Stripe Brazil expects tax_id for Pix/Boleto if provided manually
                        // We also pass it inside the specific method data if needed
                    }
                };
            }

            // Custom handling for Pix/Boleto without PaymentElement
            if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
                confirmParams.payment_method_data = {
                    ...confirmParams.payment_method_data,
                    type: paymentMethod,
                    [paymentMethod]: {},
                    billing_details: {
                        ...confirmParams.payment_method_data?.billing_details,
                        // For Brazil, we can send tax_id in some specific ways, 
                        // but usually name/email/address suffice if intent is already configured or we pass it here.
                    }
                };
            }

            // Correct confirmation strategy:
            // For Card: elements is required.
            // For Pix/Boleto: clientSecret + manual payment_method is safer when element is hidden.
            const result = (paymentMethod === 'credit' || paymentMethod === 'debit')
                ? await stripe.confirmPayment({
                    elements: elements!,
                    confirmParams: {
                        return_url: `${window.location.origin}/pedidos`,
                    },
                    redirect: 'if_required',
                } as any)
                : await stripe.confirmPayment({
                    clientSecret,
                    confirmParams: {
                        payment_method_data: {
                            type: paymentMethod as any,
                            billing_details: billingDetails,
                        },
                        return_url: `${window.location.origin}/pedidos`,
                    },
                    redirect: 'if_required',
                } as any);

            const { error, paymentIntent } = result;

            if (error) {
                console.error('Stripe Error:', error);
                setErrorMessage(error.message || "Ocorreu um erro ao processar o pagamento.");
                toast.error(error.message || "Erro no pagamento");
            } else if (paymentIntent) {
                if (paymentIntent.status === 'succeeded') {
                    toast.success("Pagamento aprovado!");
                    onSuccess();
                } else if (paymentIntent.status === 'requires_action') {
                    const nextAction = (paymentIntent as any).next_action;

                    if (nextAction?.type === 'pix_display_qr_code') {
                        const pixInfo = nextAction.pix_display_qr_code;
                        setPixData({
                            qr_code_url: pixInfo.hosted_instructions_url,
                            qr_code_base64: pixInfo.image_url_64,
                            copy_paste: pixInfo.data
                        });
                        toast.info("QR Code Pix gerado!");
                    } else if (nextAction?.type === 'boleto_display_details') {
                        const boletoInfo = nextAction.boleto_display_details;
                        setBoletoUrl(boletoInfo.hosted_voucher_url);
                        toast.info("Boleto gerado com sucesso!");
                    } else if (nextAction?.redirect_to_url) {
                        window.location.href = nextAction.redirect_to_url.url;
                    }
                } else {
                    toast.warning("Pagamento aguardando confirmação.");
                    onSuccess();
                }
            }
        } catch (err) {
            console.error('Submit Catch:', err);
            setErrorMessage("Erro inesperado de conexão.");
            toast.error("Erro de conexão.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    Pagamento seguro via Stripe
                </h3>

                {/* Pix instructions */}
                {pixData && (
                    <div className="mt-2 p-6 bg-white border border-border rounded-xl text-center shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <QrIcon className="w-8 h-8" />
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">QR Code Pix Gerado</h4>
                        <p className="text-sm text-muted-foreground mb-6">Pague agora para confirmar seu pedido instantaneamente.</p>

                        {pixData.qr_code_base64 && (
                            <div className="bg-white p-4 rounded-xl inline-block mb-6 border-2 border-primary/20">
                                <img src={pixData.qr_code_base64} alt="QR Code Pix" className="w-56 h-56 mx-auto" />
                            </div>
                        )}

                        <div className="space-y-4 text-left">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Código Copia e Cola</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    className="flex-1 p-3 text-[10px] font-mono border border-border rounded-lg bg-muted/50"
                                    value={pixData.copy_paste}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.copy_paste);
                                        toast.success("Código copiado!");
                                    }}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Boleto instructions */}
                {boletoUrl && (
                    <div className="mt-2 p-8 bg-white border border-border rounded-xl text-center shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <FileText className="w-8 h-8" />
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">Boleto Gerado</h4>
                        <p className="text-sm text-muted-foreground mb-8">Seu boleto foi gerado com sucesso. Clique no botão abaixo para visualizá-lo.</p>

                        <Button
                            asChild
                            className="btn-primary w-full h-12 text-base font-bold"
                        >
                            <a href={boletoUrl} target="_blank" rel="noopener noreferrer">
                                Abrir Boleto Bancário
                            </a>
                        </Button>

                        <p className="text-[10px] text-muted-foreground mt-6 uppercase tracking-widest">
                            O pagamento pode levar até 3 dias úteis para compensar.
                        </p>
                    </div>
                )}

                {/* ONLY SHOW PaymentElement for Credit/Debit */}
                {(paymentMethod === 'credit' || paymentMethod === 'debit') && !pixData && !boletoUrl && (
                    <div className="animate-in fade-in duration-300">
                        <PaymentElement options={{
                            fields: {
                                billingDetails: {
                                    address: {
                                        country: 'never' as const,
                                    }
                                }
                            }
                        }} />

                        {/* Installments Selector */}
                        {paymentMethod === 'credit' && (
                            <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 text-left">
                                <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-muted-foreground">Parcelamento</label>
                                <select
                                    value={installments}
                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                                        const optionTotal = calculateOptionTotal(num);
                                        const installmentValue = optionTotal / num;
                                        const hasInterest = num > MAX_FREE_INSTALLMENTS;

                                        return (
                                            <option key={num} value={num}>
                                                {num}x de R$ {installmentValue.toFixed(2)} {hasInterest ? `(R$ ${optionTotal.toFixed(2)})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* SHOW Specialty Placeholder for Pix/Boleto */}
                {(paymentMethod === 'pix' || paymentMethod === 'boleto') && !pixData && !boletoUrl && (
                    <div className="p-6 text-center animate-in fade-in zoom-in-95 duration-300 bg-white rounded-xl border border-dashed border-primary/20 my-2">
                        <div className="p-4 bg-primary/5 rounded-full inline-block mb-4">
                            {paymentMethod === 'pix' ? <QrIcon className="w-10 h-10 text-primary" /> : <FileText className="w-10 h-10 text-primary" />}
                        </div>
                        <h4 className="font-bold text-lg mb-2">
                            {paymentMethod === 'pix' ? 'Pagamento via Pix' : 'Boleto Bancário'}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mb-6">
                            {paymentMethod === 'pix'
                                ? 'O QR Code será gerado para pagamento instantâneo.'
                                : 'O boleto será gerado com vencimento em até 3 dias.'}
                        </p>

                        <div className="text-left space-y-4 max-w-sm mx-auto p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                                    CPF do Titular <Info className="w-3 h-3" />
                                </label>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                                    className="w-full p-2.5 text-sm border border-border rounded bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                * Necessário para emissão do {paymentMethod === 'pix' ? 'Pix' : 'Boleto'} conforme normas do Banco Central.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {errorMessage && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-100">{errorMessage}</div>}

            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                        if (pixData || boletoUrl) {
                            setPixData(null);
                            setBoletoUrl(null);
                        } else {
                            onBack();
                        }
                    }}
                    disabled={isProcessing}
                >
                    Voltar
                </Button>

                {/* Submit button logic */}
                {!pixData && !boletoUrl && (
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="btn-primary flex-[2]"
                        disabled={!stripe || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                            </>
                        ) : (
                            submitLabel || `Pagar R$ ${amount.toFixed(2)}`
                        )}
                    </Button>
                )}

                {(pixData || boletoUrl) && (
                    <Button
                        type="button"
                        onClick={() => onSuccess()}
                        className="btn-primary flex-[2] bg-green-600 hover:bg-green-700 shadow-md transform active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Próximo passo <CheckCircle2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};
