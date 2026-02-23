# Documentação Técnica e Funcional: Eleven Auto Parts
**Para o Desenvolvimento do CRM Centralizado**

Este documento descreve detalhadamente as integrações, funcionalidades e a arquitetura do ecossistema Eleven Auto Parts (www.elevenautoparts.com.br), servindo como base técnica para a criação de um CRM unificado de gestão.

---

## 1. Visão Geral do Sistema
A Eleven Auto Parts é um e-commerce especializado em autopeças (foco atual em palhetas automotivas). O sistema é dividido em um **Frontend** moderno (React/Vite) e um **Backend** robusto (Node.js/Express), utilizando **Supabase** como infraestrutura principal de banco de dados e autenticação.

---

## 2. Arquitetura Técnica (Stack)
- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, Shadcn/UI.
- **Backend**: Node.js, Express.
- **Banco de Dados**: PostgreSQL (via Supabase).
- **Autenticação**: Supabase Auth (Suporte a E-mail/Senha e Social Login).
- **Hospedagem**: Vercel (Frontend e Backend).

---

## 3. Integrações de Terceiros (Core Integrations)

### A. ERP Bling (API v3 - OAuth 2.0)
A integração mais crítica do sistema para fins de CRM e conformidade fiscal.
- **Fluxo de Pedidos**: Quando uma venda é confirmada, o backend cria automaticamente um **Pedido de Venda** no Bling.
- **Emissão de NF-e**: O sistema está preparado para solicitar a emissão da Nota Fiscal e capturar a **Chave de Acesso** e o **Link do DANFE**.
- **Sincronização de Contatos**: Verifica o cliente pelo CPF no Bling antes de criar o pedido, evitando duplicidade.
- **Sincronização de Produtos**: Mapeamento de SKUs entre a loja e o ERP.
- **Escopos Utilizados**: `vendas:write`, `vendas:read`, `produtos:read`, `contatos:read`, `notas_fiscais:write`.

### B. Pagamentos: Stripe
- **Checkout**: Utiliza o Stripe Checkout (Redirect ou Elements).
- **Webhooks**: O sistema processa eventos `checkout.session.completed` e `payment_intent.succeeded` para liberar pedidos.
- **Sincronização de Catálogo**: Scripts existentes fazem a ponte entre produtos cadastrados no Stripe e no banco de dados local.

### C. Logística e Frete: Melhor Envio
- **Cálculo de Frete**: Integração em tempo real no carrinho e checkout para calcular valores (Correios, Jadlog, etc).
- **Rastreamento (Tracking)**: API para consulta de status de entrega em tempo real dentro da área do cliente.
- **Gestão de Etiquetas**: Preparado para a geração de etiquetas de envio diretamente pelo fluxo de pedidos.

### D. Avaliações: Google Places API
- **Social Proof**: Captura automática das avaliações da Eleven Auto Parts no Google para exibição dinâmica no site.
- **Cache**: Sistema de cache de 12 horas para garantir performance e evitar custos excessivos de API.

### E. Comunicação: Nodemailer
- **Transacional**: Envio de e-mails de confirmação de pedido, mudança de status e recuperação de senha.

---

## 4. Funcionalidades Detalhadas

### 4.1. Gestão de Produtos
- **Catálogo Dinâmico**: Organização por categorias, marcas e compatibilidade de veículos.
- **Ficha Técnica**: Dimensões (altura, largura, profundidade, peso) integradas ao cálculo de frete.
- **Controle de Estoque**: Sincronização básica via Supabase, com planos de centralização no CRM.

### 4.2. Gestão de Clientes e Perfis
- **Perfis Detalhados**: Dados cadastrais (Nome, CPF, Telefone), múltiplos endereços de entrega e histórico de compras.
- **Sistema de Indique e Ganhe**: Programa de fidelidade onde clientes ganham benefícios por indicações bem-sucedidas.
- **Cupons de Desconto**: Gestão de cupons por valor fixo ou porcentagem.

### 4.3. Fluxo de Vendas (Checkout)
- **Carrinho Persistente**: Armazenado localmente e sincronizado com o banco.
- **Checkout Multi-etapa**: Validação de CEP, seleção de frete, escolha de método de pagamento e resumo do pedido.

### 4.4. Pós-Venda e Suporte
- **Área do Cliente**: Histórico de pedidos com status em tempo real.
- **Rastreio Interno**: Página dedicada (`/tracking`) que consome a API do Melhor Envio.
- **Políticas**: Seções dedicadas a Trocas, Devoluções e Cancelamentos.

---

## 5. Requisitos para o Novo CRM
Para consolidar a gestão em um único lugar, o CRM deve herdar e expandir as seguintes capacidades:

1.  **Gestão de Vendas (Single Source of Truth)**:
    - Painel centralizando Pedidos da Loja, Status de Pagamento (Stripe) e Status de Entrega (Melhor Envio).
    - Botão de "Emitir Nota Fiscal" que dispara o serviço do Bling diretamente do CRM.

2.  **Gestão de Produtos e Serviços**:
    - Tela única para editar preços, estoque e descrições (sincronizando com Bling e Loja).
    - Módulo de **Serviços**: Permitiu o cadastro e agendamento de serviços (ex: instalação de palhetas).

3.  **CRM de Clientes**:
    - Timeline do cliente: Visualizar e-mails enviados, conversas de suporte, compras e devoluções.
    - Gestão do **Indique e Ganhe** com aprovação manual de benefícios.

4.  **Módulo de Devoluções (Reverse Logistics)**:
    - Workflow para receber solicitações de devolução, gerar etiquetas reversas no Melhor Envio e processar reembolsos no Stripe/Bling.

5.  **Dashboard de BI (Business Intelligence)**:
    - Gráficos de vendas, produtos mais vendidos, ticket médio e taxa de retorno.

6.  **Integração com WhatsApp (Desejável)**:
    - Notificações automáticas de pedido pago e item enviado via API de WhatsApp.

---
**Documento gerado por:** Antigravity AI
**Data:** 19/02/2026
**Uso Destinado:** Planejamento e Arquitetura do CRM Eleven Auto Parts.
