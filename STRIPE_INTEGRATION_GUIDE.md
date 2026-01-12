# Guia de Integração Dinâmica: Stripe + ElevenAutoParts

Agora você pode gerenciar seus produtos diretamente pelo Painel do Stripe! Toda criação, edição ou exclusão no Stripe será refletida automaticamente na sua loja.

## 1. Como configurar no Stripe
Para que os produtos apareçam com todas as informações técnicas (marca, carro, etc.), você deve preencher o campo **Metadados** de cada produto no Stripe com as seguintes chaves:

| Chave | Exemplo de Valor | Descrição |
| :--- | :--- | :--- |
| `marca` | Bosch | A marca da palheta |
| `carro` | Sedan, SUV, Hatch | Tipos de carros compatíveis |
| `conector` | Gancho | Tipo de encaixe |
| `tamanho_motorista` | 24" | Tamanho da palheta principal |
| `tamanho_passageiro` | 18" | Tamanho da palheta secundária |
| `preco_promocional` | 89.90 | Preço com desconto (opcional) |
| `categoria` | palhetas-dianteiras | Slug da categoria (opcional) |

> **Nota:** O preço principal do site será extraído do "Preço Padrão" que você definir no Stripe.

## 2. Configurando o Webhook (Sincronização Automática)
Para que o Stripe avise o site quando algo mudar:
1. Vá em **Stripe Dashboard > Developers > Webhooks**.
2. Clique em **Add Endpoint**.
3. URL: `https://[SEU-PROJETO-SUPABASE].supabase.co/functions/v1/stripe-sync`
4. Eventos para ouvir:
   - `product.created`
   - `product.updated`
   - `product.deleted`
   - `price.updated`
5. Copie o **Signing Secret** e adicione como variável de ambiente no Supabase com o nome `STRIPE_WEBHOOK_SECRET`.

## 3. Variáveis de Ambiente Necessárias (Supabase Edge Functions)
No seu painel do Supabase, configure as seguintes Secrets:
- `STRIPE_SECRET_KEY`: Sua chave secreta do Stripe (sk_test_...).
- `STRIPE_WEBHOOK_SECRET`: O segredo do passo anterior.

## 4. Sincronização Manual (Rápida)
Se você já tem produtos no Stripe e quer importar todos de uma vez agora, você pode usar o script que criei em `src/scripts/sync-stripe.ts`.

Para rodar:
1. Certifique-se de ter as chaves no seu `.env`.
2. Execute: `npx tsx src/scripts/sync-stripe.ts`

---
**Dica Premium:** Se você deletar um produto no Stripe, ele será removido do site instantaneamente. Se você apenas desativar (Archive), ele continuará no banco mas o site pode ser configurado para ocultá-lo.
