# 🎯 Guia de Integração Stripe - Adaptado para Sua Estrutura

## ✅ Situação Atual

Você JÁ TEM:
- ✅ Tabela `produtos` com todos os campos necessários
- ✅ Tabela `pedidos` (pedido)
- ✅ Tabela `item_pedido` para itens dos pedidos
- ✅ Tabela `pagamentos` (pagamento)
- ✅ Migration para adicionar `stripe_product_id` e `stripe_price_id`

## 🚀 Passos para Integração

### **PASSO 1: Executar Migration Stripe (Se ainda não executou)**

Execute no Supabase SQL Editor:

```sql
-- Add Stripe tracking columns to products table
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Index for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_produtos_stripe_id ON public.produtos(stripe_product_id);
```

### **PASSO 2: Configurar Variáveis de Ambiente**

Adicione ao `.env`:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
```

### **PASSO 3: Criar Produtos na Stripe e Sincronizar**

**Opção A - Para cada produto existente no banco:**

1. Acesse [Stripe Dashboard - Products](https://dashboard.stripe.com/products)
2. Clique em **+ Add Product**
3. Preencha:
   - Nome (mesmo da tabela `produtos.nome`)
   - Descrição (`produtos.descricao`)
   - Preço (`produtos.preco`)
   - Imagem (`produtos.imagem_principal`)
4. Salve e copie:
   - **Product ID** (prod_XXXXX)
   - **Price ID** (price_XXXXX)

5. Atualize no Supabase:

```sql
UPDATE public.produtos
SET 
  stripe_product_id = 'prod_XXXXX',
  stripe_price_id = 'price_XXXXX'
WHERE sku = 'PAL-001'; -- Substitua pelo SKU do produto
```

**Opção B - Script Automatizado:**

Execute o script adaptado que criei para você (ver arquivo `scripts/sync-existing-products-stripe.ts`)

### **PASSO 4: Verificar Produtos Sincronizados**

```sql
SELECT 
  id,
  nome,
  sku,
  preco,
  stripe_product_id,
  stripe_price_id,
  ativo
FROM public.produtos
WHERE stripe_product_id IS NOT NULL;
```

### **PASSO 5: Usar no Frontend**

Os componentes já estão atualizados para usar a tabela `produtos`:

```typescript
// Buscar produtos
const { data: produtos } = await supabase
  .from('produtos')
  .select('*')
  .eq('ativo', true)
  .not('stripe_price_id', 'is', null); // Apenas produtos com Stripe configurado
```

### **PASSO 6: Criar API de Checkout**

Crie um endpoint para processar pagamentos (exemplo Node.js):

```javascript
// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

app.post('/api/create-checkout-session', async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    // Buscar produto no Supabase
    const { data: produto } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', productId)
      .single();

    if (!produto || !produto.stripe_price_id) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: produto.stripe_price_id,
          quantity: quantity,
        },
      ],
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout/cancel`,
      metadata: {
        product_id: produto.id,
        product_sku: produto.sku,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **PASSO 7: Configurar Webhook (Opcional mas Recomendado)**

1. Acesse [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Adicione endpoint: `https://seu-dominio.com/api/webhooks/stripe`
3. Selecione eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`

**Handler do Webhook:**

```javascript
// api/webhooks/stripe.js
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Criar pedido no Supabase
    const { data: pedido } = await supabase
      .from('pedido')
      .insert({
        id_usuario: session.customer_email, // Ajuste conforme sua lógica
        status: 'pago',
        valor_total: session.amount_total / 100,
        // ... outros campos
      })
      .select()
      .single();

    // Criar pagamento
    await supabase
      .from('pagamento')
      .insert({
        id_pedido: pedido.id_pedido,
        valor: session.amount_total / 100,
        status: 'aprovado',
        gateway: 'stripe',
        id_transacao_gateway: session.payment_intent,
        data_pagamento: new Date().toISOString(),
      });

    // Criar itens do pedido
    // ... lógica para criar item_pedido
  }

  res.json({ received: true });
});
```

---

## 📊 Estrutura do Banco (Sua estrutura atual)

```
produtos
├── id
├── nome
├── descricao
├── preco
├── sku
├── stripe_product_id ← NOVO
└── stripe_price_id   ← NOVO

pedido (ou pedidos)
├── id_pedido
├── status
└── valor_total

pagamento (ou pagamentos)
├── id_pagamento
├── id_pedido
├── valor
├── status
└── gateway

item_pedido
├── id_item_pedido
├── id_pedido
├── id_produto
├── quantidade
└── preco_unitario
```

---

## 🎯 Checklist Rápido

- [ ] Obter chaves Stripe (Dashboard → API Keys)
- [ ] Adicionar ao `.env`
- [ ] Executar migration (adicionar colunas stripe)
- [ ] Criar produtos na Stripe
- [ ] Sincronizar IDs com tabela `produtos`
- [ ] Testar busca de produtos no frontend
- [ ] Criar endpoint `/api/create-checkout-session`
- [ ] Testar checkout com cartão de teste
- [ ] (Opcional) Configurar webhook
- [ ] (Opcional) Implementar criação automática de pedidos

---

## 🧪 Teste Rápido

```sql
-- Ver produtos prontos para venda
SELECT 
  nome,
  sku,
  preco,
  CASE 
    WHEN stripe_price_id IS NOT NULL THEN '✅ Pronto'
    ELSE '❌ Falta configurar'
  END as status_stripe
FROM public.produtos
WHERE ativo = true;
```

---

## 📝 Próximos Passos

1. Execute a migration (Passo 1)
2. Configure `.env` (Passo 2)
3. Crie 1 produto de teste na Stripe (Passo 3)
4. Sincronize o ID (Passo 3)
5. Teste o checkout

**Tudo adaptado para sua estrutura existente! 🚀**
