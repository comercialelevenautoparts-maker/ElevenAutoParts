import { useState } from 'react';
import { toast } from 'sonner';

export interface ShippingOption {
    id: number | string;
    name: string;
    price: string | number;
    custom_price: string | number;
    currency: string;
    delivery_time: number;
    company: {
        name: string;
        picture: string;
    };
}

export const useShipping = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<ShippingOption[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || '';

    const calculateShipping = async (cep: string, items: any[]) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            toast.error('CEP inválido');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/frete/calcular`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cepDestino: cleanCep,
                    itens: items.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao calcular frete');
            }

            const data = await response.json();
            setOptions(data);
        } catch (err: any) {
            console.error('Shipping calculation error:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        calculateShipping,
        isLoading,
        options,
        error
    };
};
