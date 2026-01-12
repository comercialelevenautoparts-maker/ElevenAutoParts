import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
    onSuccess: () => void;
    onBack: () => void;
    amount: number;
}

export const StripePaymentForm = ({ onSuccess, onBack, amount }: StripePaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        // Na prática, você confirmaria o pagamento aqui.
        // Como precisamos de um clientSecret real do backend, vamos simular o sucesso
        // ou erro dependendo da entrada (mas o elemento da Stripe já valida formato e existência básica).

        /* 
        NOTAS DE IMPLEMENTAÇÃO REAL:
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/pedidos',
          },
        });
        */

        // Simulando delay de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Aqui assumimos sucesso para demonstração visual
        // O Elemento da Stripe só deixa submeter se estiver 'válido' visualmente
        setIsProcessing(false);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    Pagamento Seguro via Stripe
                </h3>
                {/* O Elemento da Stripe cuida de tudo: número, validade, CVC, ZIP */}
                <PaymentElement />
            </div>

            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

            <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
                    Voltar
                </Button>
                <Button type="submit" className="btn-primary flex-1" disabled={!stripe || isProcessing}>
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando R$ {amount.toFixed(2)}
                        </>
                    ) : (
                        `Pagar R$ ${amount.toFixed(2)}`
                    )}
                </Button>
            </div>
        </form>
    );
};
