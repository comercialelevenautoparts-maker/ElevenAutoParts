// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: any) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        let event

        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
        } else {
            event = JSON.parse(body)
        }

        console.log(`Processing event: ${event.type}`)

        if (event.type === 'product.created' || event.type === 'product.updated') {
            const product = event.data.object
            const priceId = typeof product.default_price === 'string'
                ? product.default_price
                : product.default_price?.id

            let priceAmount = 0
            if (priceId) {
                const price = await stripe.prices.retrieve(priceId)
                priceAmount = (price.unit_amount ?? 0) / 100
            }

            const { data, error } = await supabase
                .from('produtos')
                .upsert({
                    stripe_product_id: product.id,
                    stripe_price_id: priceId,
                    nome: product.name,
                    descricao: product.description,
                    imagem_principal: product.images?.[0] ?? null,
                    preco: priceAmount,
                    preco_promocional: product.metadata.preco_promocional ? parseFloat(product.metadata.preco_promocional) : null,
                    marca: product.metadata.marca ?? null,
                    carro: product.metadata.carro ?? null,
                    conectores: product.metadata.conector ?? null,
                    ativo: product.active,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'stripe_product_id' })

            if (error) throw error
        }

        if (event.type === 'product.deleted') {
            const product = event.data.object
            await supabase
                .from('produtos')
                .delete()
                .eq('stripe_product_id', product.id)
        }

        if (event.type === 'price.updated') {
            const price = event.data.object
            if (price.product) {
                const productId = typeof price.product === 'string' ? price.product : price.product.id
                await supabase
                    .from('produtos')
                    .update({
                        preco: (price.unit_amount ?? 0) / 100,
                        stripe_price_id: price.id
                    })
                    .eq('stripe_product_id', productId)
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: any) {
        console.error(`Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
