/**
 * Utilitários para integração com Stripe Checkout
 */

import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
    console.error('VITE_STRIPE_PUBLISHABLE_KEY não encontrada nas variáveis de ambiente');
}

export const stripePromise = loadStripe(stripePublishableKey);

export interface CheckoutSessionData {
    priceId: string;
    quantity?: number;
    successUrl?: string;
    cancelUrl?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
}

/**
 * Cria uma sessão de checkout na Stripe
 * 
 * @param data Dados para criar a sessão
 * @returns Session ID da Stripe
 */
const API_URL = import.meta.env.VITE_API_URL || '';

export async function createCheckoutSession(data: CheckoutSessionData) {
    try {
        const response = await fetch(`${API_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: data.priceId,
                quantity: data.quantity || 1,
                successUrl: data.successUrl || `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: data.cancelUrl || `${window.location.origin}/checkout/cancel`,
                customerEmail: data.customerEmail,
                metadata: data.metadata,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar sessão de checkout');
        }

        const session = await response.json();
        return session;
    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        throw error;
    }
}

/**
 * Redireciona para o checkout da Stripe
 * 
 * @param priceId ID do preço do produto na Stripe
 * @param quantity Quantidade (padrão: 1)
 * @param options Opções adicionais
 */
export async function redirectToCheckout(
    priceId: string,
    quantity: number = 1,
    options?: {
        customerEmail?: string;
        metadata?: Record<string, string>;
    }
) {
    try {
        const stripe = await stripePromise;

        if (!stripe) {
            throw new Error('Stripe não foi inicializado corretamente');
        }

        // Criar sessão de checkout
        const session = await createCheckoutSession({
            priceId,
            quantity,
            customerEmail: options?.customerEmail,
            metadata: options?.metadata,
        });

        // Redirecionar para URL da sessão (método preferido)
        if (session.url) {
            window.location.href = session.url;
            return;
        }

        // Fallback: usar sessionId
        const result = await (stripe as any).redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Erro ao redirecionar para checkout:', error);
        throw error;
    }
}

/**
 * Formata preço em BRL
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
}

/**
 * Converte preço de centavos para reais
 */
export function centsToReais(cents: number): number {
    return cents / 100;
}

/**
 * Converte preço de reais para centavos
 */
export function reaisToCents(reais: number): number {
    return Math.round(reais * 100);
}
