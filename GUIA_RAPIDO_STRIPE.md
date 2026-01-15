# 🚀 Guia Rápido: Integração Stripe - Passo a Passo

## ✅ Checklist de Implementação

### **PASSO 1: Configurar Stripe Dashboard**

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers** → **API Keys**
3. Copie suas chaves:
   - `Publishable key` (pk_test_...)
   - `Secret key` (sk_test_...)

### **PASSO 2: Configurar Variáveis de Ambiente**

Adicione ao arquivo `.env`:

```env
# Adicione estas linhas
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
```

### **PASSO 3: Executar Migration no Supabase**

1. Acesse: https://supabase.com/dashboard/project/yagisisjkodcdhczmpbf/sql/new
2. Cole e execute o SQL do arquivo:
   `supabase/migrations/20260114_create_products_and_orders_tables.sql`

### **PASSO 4: Criar Produtos na Stripe**

**Opção A - Script Automatizado (Recomendado):**

```bash
# Instalar dependência
npm install tsx --save-dev

# Adicionar script no package.json
"scripts": {
  "stripe:create": "tsx scripts/create-stripe-products.ts"
}

# Executar
npm run stripe:create
```

**Opção B - Manualmente no Dashboard:**

1. Acesse [Stripe Products](https://dashboard.stripe.com/products)
2. Clique em **+ Add Product**
3. Preencha:
   - Nome do produto
   - Descrição
   - Preço (em R$)
   - Imagem (URL)
4. Salve e copie o `Price ID` (começa com `price_...`)

### **PASSO 5: Sincronizar Produtos com Supabase**

Execute este SQL no Supabase para cada produto criado:

```sql
INSERT INTO public.products (
  stripe_product_id,
  stripe_price_id,
  name,
  description,
  price,
  currency,
  image_url,
  category,
  sku,
  stock_quantity,
  active
) VALUES (
  'prod_XXXXXXXXX',  -- ID do produto da Stripe
  'price_XXXXXXXXX', -- ID do preço da Stripe
  'Nome do Produto',
  'Descrição do produto',
  89.99,             -- Preço em reais
  'BRL',
  '/assets/product-image.jpg',
  'palhetas',
  'PAL-001',
  50,                -- Quantidade em estoque
  true
);
```

### **PASSO 6: Atualizar Componentes (Já Feito!)**

Os seguintes arquivos já foram criados/atualizados:

- ✅ `src/hooks/useStripeProducts.ts` - Hook para buscar produtos
- ✅ `src/lib/stripe/checkout.ts` - Utilitários de checkout
- ✅ `src/components/products/ProductCard.tsx` - Card com botão "Comprar"

### **PASSO 7: Criar API de Checkout (Backend)**

Você precisará criar um endpoint de API para criar sessões de checkout.

**Exemplo com Node.js/Express:**

```javascript
// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, quantity } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: quantity || 1,
        },
      ],
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **PASSO 8: Testar**

1. Execute o projeto: `npm run dev`
2. Navegue até a página de produtos
3. Clique em "Comprar" em um produto
4. Use cartão de teste: `4242 4242 4242 4242`
5. Data: Qualquer futura
6. CVV: Qualquer 3 dígitos

---

## 📊 Resumo do Fluxo

```
1. Usuário clica em "Comprar"
   ↓
2. Frontend chama /api/create-checkout-session
   ↓
3. Backend cria sessão na Stripe
   ↓
4. Frontend redireciona para Stripe Checkout
   ↓
5. Usuário paga
   ↓
6. Stripe redireciona para /checkout/success
```

---

## 🔧 Próximos Passos Opcionais

- [ ] Configurar Webhooks para confirmação de pagamento
- [ ] Criar página de sucesso (`/checkout/success`)
- [ ] Criar página de cancelamento (`/checkout/cancel`)
- [ ] Implementar envio de emails de confirmação
- [ ] Adicionar gerenciamento de estoque

---

## ⚠️ Notas Importantes

1. **Modo de Teste**: Use sempre `pk_test_` e `sk_test_` para desenvolvimento
2. **Segurança**: NUNCA exponha `STRIPE_SECRET_KEY` no frontend
3. **Produção**: Troque para chaves `pk_live_` e `sk_live_` apenas em produção
4. **Webhooks**: Configure apenas quando estiver pronto para produção

---

## 🆘 Problemas Comuns

**Erro: "products table does not exist"**
- Execute a migration do Supabase (Passo 3)

**Erro: "STRIPE_SECRET_KEY not found"**
- Verifique se adicionou as chaves no `.env`
- Reinicie o servidor após adicionar

**Produtos não aparecem**
- Verifique se executou o script de criação
- Confirme que `active = true` no Supabase

---

## 📚 Arquivos Criados

1. `STRIPE_PRODUCTS_INTEGRATION.md` - Documentação completa
2. `supabase/migrations/20260114_create_products_and_orders_tables.sql` - Migration
3. `scripts/create-stripe-products.ts` - Script de criação automática
4. `src/hooks/useStripeProducts.ts` - Hook React
5. `src/lib/stripe/checkout.ts` - Utilitários
6. `src/components/products/ProductCard.tsx` - Componente atualizado

---

**Pronto! Siga os passos acima e sua integração estará funcionando! 🎉**
