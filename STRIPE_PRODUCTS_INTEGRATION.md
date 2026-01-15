# 🛍️ Guia Completo de Integração Stripe - ElevenAutoParts

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Criação de Produtos na Stripe](#criação-de-produtos-na-stripe)
4. [Sincronização com Supabase](#sincronização-com-supabase)
5. [Integração Frontend](#integração-frontend)
6. [Sistema de Checkout](#sistema-de-checkout)
7. [Webhooks](#webhooks)
8. [Testes](#testes)

---

## 🎯 Visão Geral

Esta integração permite:
- ✅ Criar produtos automaticamente na Stripe
- ✅ Sincronizar produtos com Supabase
- ✅ Exibir produtos dinâmicos no frontend
- ✅ Processar pagamentos com Stripe Checkout
- ✅ Gerenciar webhooks para confirmação de pagamentos
- ✅ Atualizar estoque e pedidos automaticamente

---

## ⚙️ Configuração Inicial

### 1. Obter Credenciais da Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers** → **API Keys**
3. Copie:
   - **Publishable key** (começa com `pk_test_` ou `pk_live_`)
   - **Secret key** (começa com `sk_test_` ou `sk_live_`)

### 2. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_publishable_key_aqui
STRIPE_SECRET_KEY=sk_test_seu_secret_key_aqui

# Stripe Webhook (será configurado depois)
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

⚠️ **IMPORTANTE**: Adicione `.env` ao `.gitignore` para não expor suas chaves!

---

## 🏗️ Criação de Produtos na Stripe

### Estrutura de Produtos

Nossos produtos terão:
- **Nome**: Nome do produto
- **Descrição**: Descrição detalhada
- **Preço**: Em centavos (R$ 89,99 = 8999)
- **Imagens**: URLs das imagens
- **Metadata**: Informações adicionais (categoria, SKU, etc.)

### Opções de Criação

#### **Opção 1: Script Automatizado (Recomendado)**

Execute o script `scripts/create-stripe-products.ts` que criará todos os produtos automaticamente.

```bash
npm run stripe:create-products
```

#### **Opção 2: Manualmente via Dashboard**

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Clique em **+ Add Product**
3. Preencha os dados
4. Adicione preços
5. Salve

#### **Opção 3: Via API (Programaticamente)**

Use o arquivo `src/lib/stripe/create-products.ts` para criar produtos via código.

---

## 🗄️ Sincronização com Supabase

### 1. Criar Tabela de Produtos

Execute a migration `supabase/migrations/20260114_create_products_table.sql`:

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  image_url TEXT,
  category TEXT,
  metadata JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Sincronizar Produtos

O script de criação já sincroniza automaticamente com Supabase.

---

## 🎨 Integração Frontend

### 1. Configurar Stripe no Frontend

Arquivo: `src/lib/stripe/stripe-client.ts`

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);
```

### 2. Hook para Buscar Produtos

Arquivo: `src/hooks/useStripeProducts.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useStripeProducts() {
  return useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
```

### 3. Componente de Produto Atualizado

O componente `ProductCard` será atualizado para usar dados da Stripe.

---

## 💳 Sistema de Checkout

### 1. Criar Sessão de Checkout

Arquivo: `src/lib/stripe/create-checkout.ts`

```typescript
export async function createCheckoutSession(priceId: string) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const session = await response.json();
  return session;
}
```

### 2. Redirecionar para Checkout

```typescript
import { stripePromise } from '@/lib/stripe/stripe-client';

async function handleCheckout(priceId: string) {
  const stripe = await stripePromise;
  const session = await createCheckoutSession(priceId);
  
  await stripe?.redirectToCheckout({
    sessionId: session.id,
  });
}
```

---

## 🔔 Webhooks

### 1. Configurar Webhook na Stripe

1. Acesse [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **+ Add endpoint**
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 2. Handler de Webhook

Arquivo: `api/webhooks/stripe.ts`

O webhook processará:
- ✅ Confirmação de pagamento
- ✅ Criação de pedido no Supabase
- ✅ Envio de email de confirmação
- ✅ Atualização de estoque

---

## 🧪 Testes

### Modo de Teste

Use cartões de teste da Stripe:

| Cartão | Número | Resultado |
|--------|--------|-----------|
| Sucesso | 4242 4242 4242 4242 | Pagamento aprovado |
| Recusado | 4000 0000 0000 0002 | Pagamento recusado |
| 3D Secure | 4000 0027 6000 3184 | Requer autenticação |

**Data de validade**: Qualquer data futura  
**CVV**: Qualquer 3 dígitos  
**CEP**: Qualquer CEP válido

---

## 📊 Fluxo Completo

```
1. Cliente navega na loja
   ↓
2. Produtos carregados do Supabase (sincronizados com Stripe)
   ↓
3. Cliente clica em "Comprar"
   ↓
4. Cria sessão de checkout na Stripe
   ↓
5. Redireciona para Stripe Checkout
   ↓
6. Cliente preenche dados e paga
   ↓
7. Stripe envia webhook
   ↓
8. Backend processa webhook
   ↓
9. Cria pedido no Supabase
   ↓
10. Redireciona cliente para página de sucesso
```

---

## 🚀 Próximos Passos

1. ✅ Executar script de criação de produtos
2. ✅ Configurar variáveis de ambiente
3. ✅ Executar migration do Supabase
4. ✅ Testar criação de produtos
5. ✅ Implementar checkout
6. ✅ Configurar webhooks
7. ✅ Testar fluxo completo

---

## 📝 Checklist de Implementação

- [ ] Obter chaves da Stripe
- [ ] Configurar `.env`
- [ ] Executar migration do Supabase
- [ ] Executar script de criação de produtos
- [ ] Verificar produtos no Stripe Dashboard
- [ ] Verificar produtos no Supabase
- [ ] Testar exibição de produtos no frontend
- [ ] Implementar botão de checkout
- [ ] Configurar webhook
- [ ] Testar pagamento completo
- [ ] Configurar emails de confirmação

---

## 🆘 Troubleshooting

### Produtos não aparecem no frontend
- Verifique se os produtos estão marcados como `active: true`
- Confirme que a sincronização com Supabase funcionou
- Verifique logs do console

### Erro ao criar checkout
- Confirme que `VITE_STRIPE_PUBLISHABLE_KEY` está correto
- Verifique se o `priceId` é válido
- Confira logs de rede no DevTools

### Webhook não funciona
- Verifique se a URL está acessível publicamente
- Confirme que o `STRIPE_WEBHOOK_SECRET` está correto
- Use Stripe CLI para testar localmente: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## 📚 Recursos

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Documentation](https://supabase.com/docs)
