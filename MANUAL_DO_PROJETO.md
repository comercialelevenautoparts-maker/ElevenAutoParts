# Manual de Integração Bling - Eleven Auto Parts

Este documento descreve como configurar e operar a integração entre a loja Eleven Auto Parts e o Bling ERP para emissão de pedidos de venda e notas fiscais.

## 🚀 Guia Rápido de Configuração

### 1. Requisitos Prévios no Bling
Siga estes passos para preparar sua conta Bling:
1.  Vá em **Preferências (Engrenagem) > Sistema > Usuários e Usuário API**.
2.  Crie ou edite o seu usuário e anote o **Client ID** e **Client Secret** (se estiver usando o App de Integração).
3.  Garanta que as permissões de **Vendas**, **Produtos** e **Notas Fiscais** estejam habilitadas (Ver e Editar).

### 2. Configuração no Código (.env)
No arquivo `backend/.env`, as seguintes variáveis devem estar configuradas:
```env
BLING_CLIENT_ID="seu_client_id"
BLING_CLIENT_SECRET="seu_client_secret"
BLING_CALLBACK_URL="http://localhost:3000/api/bling/callback"
```

### 3. Primeira Autenticação (OAuth)
Como a API V3 do Bling usa OAuth 2.0, você precisa autorizar o acesso uma única vez:
1.  Acesse: `http://localhost:3000/api/bling/auth`
2.  Faça login no Bling e clique em **Autorizar**.
3.  O sistema salvará os tokens no banco de dados Supabase e cuidará da renovação automática (Refresh Token).

---

## 🛠️ Fluxo de Funcionamento

### 1. Venda Concluída
A integração é disparada automaticamente via **Webhook do Stripe**.
*   Quando o status do pagamento muda para `succeeded`.
*   O backend marca o pedido como `pago`.
*   O serviço `BlingService.createSalesOrder(orderId)` é chamado.

### 2. Criação do Pedido no Bling
O sistema realiza as seguintes ações:
1.  Busca os dados do cliente, itens do pedido e endereço de entrega no Supabase.
2.  Mapeia os SKUs dos produtos para que coincidam com o cadastro do Bling.
3.  Envia um `POST` para a API do Bling criando um **Pedido de Venda**.
4.  Salva o ID do pedido do Bling em nosso banco de dados (`nfe_key`) e altera o status para `pedido_criado`.

### 3. Emissão de NF-e
Atualmente, o sistema cria o **Pedido de Venda** no Bling. A partir do pedido no painel do Bling, você pode emitir a Nota Fiscal com um clique, ou podemos evoluir a integração para emitir a nota automaticamente assim que o pedido for criado.

---

## 🧪 Testes e utilitários

### Script de Teste Automático
Você pode testar a conexão e a criação de produtos/pedidos via terminal:
```bash
cd backend
node test_bling_integration.js
```

### Endpoints de Manutenção
*   `GET /api/bling/status`: Verifica se a conexão com o Bling está ativa.
*   `GET /api/bling/auth`: Inicia o processo de login/autorização.
*   `GET /api/bling/test-create-product`: Cria um produto fictício no seu Bling para validar permissões de escrita.

---

## ⚠️ Possíveis Erros e Soluções

| Erro | Causa Provável | Solução |
| :--- | :--- | :--- |
| `PERMISSION_DENIED` | O usuário API não tem acesso a "Vendas" ou "NF-e". | Ajustar as permissões de usuário no painel do Bling. |
| `Token expired` | O sistema não conseguiu renovar o token. | Acesse `/api/bling/auth` novamente para reautorizar. |
| `Order not found` | O `orderId` enviado pelo Stripe não existe no banco. | Verificar se o Webhook do Stripe está configurado para o banco correto. |
| `read ECONNRESET` | Problema na conexão com o banco de dados. | Verificar se a tabela `integrations` foi criada no Supabase via `MIGRATION_BLING.sql`. |

---
*Atualizado em 17/02/2026 por Antigravity AI.*
