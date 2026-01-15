/**
 * Script para criar produtos na Stripe e sincronizar com Supabase
 * 
 * Como usar:
 * 1. Configure as variáveis de ambiente no .env
 * 2. Execute: npx tsx scripts/create-stripe-products.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Validar variáveis de ambiente
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não encontrada no .env');
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Credenciais do Supabase não encontradas no .env');
}

// Inicializar Stripe e Supabase
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Definir produtos a serem criados
const productsToCreate = [
    {
        name: 'Par de Palhetas do Limpador de Parabrisa Premium',
        description: 'Palhetas de alta qualidade com tecnologia de limpeza superior. Compatível com diversos modelos de veículos.',
        price: 8999, // R$ 89,99 em centavos
        category: 'palhetas',
        sku: 'PAL-PREM-001',
        stock: 50,
        images: ['https://seu-dominio.com/images/product-palheta.jpg'],
        metadata: {
            category: 'palhetas',
            quality: 'premium',
            warranty: '12 meses',
        },
    },
    {
        name: 'Borracha de Vedação Universal',
        description: 'Borracha de vedação universal de alta durabilidade. Resistente a variações climáticas.',
        price: 4599, // R$ 45,99
        category: 'borrachas',
        sku: 'BOR-UNI-001',
        stock: 100,
        images: ['https://seu-dominio.com/images/product-rubber.jpg'],
        metadata: {
            category: 'borrachas',
            type: 'universal',
            warranty: '6 meses',
        },
    },
    {
        name: 'Conector Premium Alta Durabilidade',
        description: 'Conector premium com alta resistência e durabilidade. Fácil instalação.',
        price: 6599, // R$ 65,99
        category: 'conectores',
        sku: 'CON-PREM-001',
        stock: 75,
        images: ['https://seu-dominio.com/images/product-connector.jpg'],
        metadata: {
            category: 'conectores',
            quality: 'premium',
            warranty: '12 meses',
        },
    },
    {
        name: 'Par de Palhetas Pro - Linha Profissional',
        description: 'Palhetas profissionais com tecnologia avançada de limpeza. Indicado para uso intensivo.',
        price: 12999, // R$ 129,99
        category: 'palhetas',
        sku: 'PAL-PRO-001',
        stock: 30,
        images: ['https://seu-dominio.com/images/product-wiper2.jpg'],
        metadata: {
            category: 'palhetas',
            quality: 'professional',
            warranty: '24 meses',
        },
    },
    {
        name: 'Conector Universal - Compatível com Todos',
        description: 'Conector universal compatível com todos os modelos de palhetas. Instalação rápida.',
        price: 3999, // R$ 39,99
        category: 'conectores',
        sku: 'CON-UNI-001',
        stock: 120,
        images: ['https://seu-dominio.com/images/product-connector2.jpg'],
        metadata: {
            category: 'conectores',
            type: 'universal',
            warranty: '6 meses',
        },
    },
    {
        name: 'Palheta Silicone - Longa Duração',
        description: 'Palheta de silicone com longa duração. Resistente a altas temperaturas.',
        price: 7499, // R$ 74,99
        category: 'palhetas',
        sku: 'PAL-SIL-001',
        stock: 60,
        images: ['https://seu-dominio.com/images/product-palheta.jpg'],
        metadata: {
            category: 'palhetas',
            material: 'silicone',
            warranty: '18 meses',
        },
    },
    {
        name: 'Kit Borrachas Completo',
        description: 'Kit completo de borrachas de vedação. Inclui todas as peças necessárias.',
        price: 11999, // R$ 119,99
        category: 'borrachas',
        sku: 'BOR-KIT-001',
        stock: 40,
        images: ['https://seu-dominio.com/images/product-rubber.jpg'],
        metadata: {
            category: 'borrachas',
            type: 'kit',
            warranty: '12 meses',
        },
    },
    {
        name: 'Conector Reforçado - Extra Resistente',
        description: 'Conector reforçado com resistência extra. Ideal para condições extremas.',
        price: 5499, // R$ 54,99
        category: 'conectores',
        sku: 'CON-REF-001',
        stock: 80,
        images: ['https://seu-dominio.com/images/product-connector.jpg'],
        metadata: {
            category: 'conectores',
            quality: 'reinforced',
            warranty: '12 meses',
        },
    },
];

async function createStripeProduct(productData: typeof productsToCreate[0]) {
    try {
        console.log(`\n🔄 Criando produto: ${productData.name}...`);

        // 1. Criar produto na Stripe
        const stripeProduct = await stripe.products.create({
            name: productData.name,
            description: productData.description,
            images: productData.images,
            metadata: productData.metadata,
            active: true,
        });

        console.log(`✅ Produto criado na Stripe: ${stripeProduct.id}`);

        // 2. Criar preço na Stripe
        const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: productData.price,
            currency: 'brl',
            metadata: {
                sku: productData.sku,
            },
        });

        console.log(`✅ Preço criado na Stripe: ${stripePrice.id}`);

        // 3. Sincronizar com Supabase
        const { data, error } = await supabase
            .from('products')
            .insert({
                stripe_product_id: stripeProduct.id,
                stripe_price_id: stripePrice.id,
                name: productData.name,
                description: productData.description,
                price: productData.price / 100, // Converter centavos para reais
                currency: 'BRL',
                image_url: productData.images[0],
                category: productData.category,
                sku: productData.sku,
                stock_quantity: productData.stock,
                metadata: productData.metadata,
                active: true,
            })
            .select()
            .single();

        if (error) {
            console.error(`❌ Erro ao sincronizar com Supabase:`, error);
            return null;
        }

        console.log(`✅ Produto sincronizado com Supabase: ${data.id}`);

        return {
            supabase: data,
            stripe: {
                product: stripeProduct,
                price: stripePrice,
            },
        };
    } catch (error) {
        console.error(`❌ Erro ao criar produto ${productData.name}:`, error);
        return null;
    }
}

async function main() {
    console.log('🚀 Iniciando criação de produtos na Stripe...\n');
    console.log(`📦 Total de produtos a criar: ${productsToCreate.length}\n`);

    const results = [];

    for (const productData of productsToCreate) {
        const result = await createStripeProduct(productData);
        results.push(result);

        // Aguardar um pouco entre cada criação para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successful = results.filter(r => r !== null).length;
    const failed = results.length - successful;

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA CRIAÇÃO DE PRODUTOS');
    console.log('='.repeat(50));
    console.log(`✅ Produtos criados com sucesso: ${successful}`);
    console.log(`❌ Produtos com erro: ${failed}`);
    console.log('='.repeat(50));

    if (successful > 0) {
        console.log('\n✨ Produtos criados na Stripe e sincronizados com Supabase!');
        console.log('🔗 Acesse o Stripe Dashboard: https://dashboard.stripe.com/products');
        console.log('🔗 Verifique no Supabase: https://supabase.com/dashboard');
    }

    if (failed > 0) {
        console.log('\n⚠️ Alguns produtos falharam. Verifique os logs acima.');
    }
}

// Executar script
main()
    .then(() => {
        console.log('\n✅ Script finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erro fatal:', error);
        process.exit(1);
    });
