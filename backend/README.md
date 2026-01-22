# Documento Completo para o Desenvolvimento da Loja Virtual Eleven Auto Parts

## Visão Geral do Projeto
Desenvolva uma aplicação e-commerce full-stack para a Eleven Auto Parts, uma loja online especializada em peças automotivas. A aplicação deve replicar fielmente os designs fornecidos no Figma em visualizações para desktop, tablet e mobile, garantindo layouts responsivos. Use React.js para o frontend, Node.js com Express para o backend e integre com Supabase para gerenciamento de banco de dados (backend PostgreSQL) e autenticação. Incorpore Stripe para processamento de pagamentos. O site está em português, então todo o texto, rótulos e elementos de UI devem corresponder aos designs.

### Diretrizes Gerais de Sistema de Design e Estilização
- **Paleta de Cores**: Ouro primário (#D4AF37) para acentos, botões, destaques e banners de newsletter. Branco (#FFFFFF) para fundos. Preto (#000000) para texto. Acentos secundários incluem gradientes roxos (ex.: #8E2DE2 para #4A00E0) para badges de métodos de pagamento como VISA. Use cinzas sutis (#F5F5F5, #A9A9A9) para bordas, placeholders e texto secundário. Vermelho (#FF0000) para mensagens de erro ou botões de remoção.
- **Tipografia**: Fonte sans-serif (ex.: Roboto ou similar) para texto corpo (14-16px). Negrito para cabeçalhos (24-32px). Ouro para chamadas à ação. Garanta line-height de 1.5 para legibilidade.
- **Layout e Responsividade**: Use CSS Grid e Flexbox para layouts. Pontos de quebra: Desktop (>1024px), Tablet (768-1024px), Mobile (<768px). Todas as páginas devem se adaptar fluidamente — ex.: empilhar elementos verticalmente no mobile, colapsar menus em hambúrguer.
- **Biblioteca de Componentes**: Construa componentes reutilizáveis com styled-components ou Tailwind CSS para consistência:
  - **Header**: Barra superior fixa com banner de fundo ouro para inscrição na newsletter ("Assine nossa newsletter..."). Abaixo: Logo (ELEVEN com swoosh de carro), links de navegação (Início, Produtos), ícone de busca, ícone de usuário, ícone de carrinho. No mobile, colapsar para menu hambúrguer.
  - **Footer**: Logo, colunas de navegação (Início, Peças por Veículo, Categorias, Suporte), input de inscrição na newsletter com botão ouro, links de termos/privacidade, ícones sociais (Twitter), copyright.
  - **Botões**: Fundo ouro, texto branco, arredondado (raio 24px), hover escurece o ouro. Variantes: Primário ("Continuar"), Secundário (contornado).
  - **Cards**: Para produtos/pedidos — imagem, título, preço, botão adicionar ao carrinho. Fundo branco, sombra sutil.
  - **Formulários**: Inputs com bordas cinza claro, placeholders em português. Validação para campos obrigatórios (erros em vermelho).
  - **Barras de Progresso**: Passos horizontais (ex.: Entrega > Pagamento > Resumo) com indicadores ativos em ouro.
  - **Ícones**: Use SVGs para busca, usuário, carrinho, corações (favoritos). Ouro ou preto conforme contexto.
- **Estilos Globais**: Fundo de página branco, container max-width 1200px, padding 16-32px. Garanta acessibilidade (rótulos ARIA, navegação por teclado).

### Implementação Específica por Página
Com base nos designs do Figma, implemente as seguintes páginas com seus componentes e comportamentos. Cada página inclui header e footer, a menos que indicado.

1. **Página Inicial (Home Page)**:
   - Seção Hero: Cabeçalho com acento ouro ("Eleve seu carro com Eleven Auto Parts"), imagem de produto (ex.: palheta de limpador), estatísticas (Mais de 1000 produtos, 99% satisfação, 24/7 suporte, 30 dias devolução).
   - Carrossel/slider de produtos em destaque com imagens, títulos, preços.
   - Grade de benefícios: Cards para qualidade, personalização, sustentabilidade, etc.
   - Depoimentos: Citações com borda ouro, estrelas, nomes de usuários.
   - Acordeão de FAQ: Perguntas como "Como posso pagar?" com respostas expansíveis.
   - Seção Seamless Experience: Passos numerados (01-04) para o processo de compra.
   - Responsivo: No mobile, hero empilha, grade vira coluna única.

2. **Página de Produtos (Products Page)**:
   - Barra de busca/filtro: Input para consulta, filtros (Todos produtos, Palhetas, Conectores, etc.), ordenação (Relevância, Preço).
   - Grade de produtos: 3-4 colunas no desktop (imagem, título, preço, adicionar ao carrinho). Paginação ou scroll infinito.
   - Barra lateral (desktop): Lista de categorias.
   - Responsivo: Mobile mostra 1-2 colunas, filtros em dropdown.

3. **Página de Detalhes do Produto (Product Detail Page)**:
   - Breadcrumb: Início > Categoria > Produto.
   - Principal: Galeria de imagens grandes (miniaturas abaixo), título, preço, descrição, especificações (ex.: Marca, Cor, Compatibilidade).
   - Botão adicionar ao carrinho com seletor de quantidade.
   - Seção de depoimentos: Similar à home.
   - FAQ: Perguntas específicas do produto.
   - Responsivo: Empilhar imagem/info no mobile.

4. **Página do Carrinho (Cart Page)**:
   - Lista de itens: Imagem, título, preço, stepper de quantidade, ícone de remoção.
   - Barra lateral de resumo: Subtotal, frete, desconto, total. Botão continuar.
   - Dropdown de opções de frete.
   - Responsivo: Barra lateral empilha abaixo no mobile.

5. **Páginas de Checkout (Multi-etapa: Endereço, Pagamento, Resumo)**:
   - Barra de progresso no topo.
   - **Endereço**: Formulário para nome, email, telefone, campos de endereço (busca CEP via API se possível), botão adicionar novo endereço. Barra lateral de resumo com totais.
   - **Pagamento - Cartão**: Campos de cartão (número, validade, CVC via Stripe Elements), adicionar novo método. Logos (Visa, Master, etc.). Barra lateral de resumo.
   - **Resumo**: Revisar endereço, método de pagamento (ex.: badge Visa com gradiente roxo), lista de itens do pedido, totais. Botão finalizar.
   - Responsivo: Formulários em largura total no mobile.
   - Integração: Use Stripe para tokenização segura de cartão e criação de intent de pagamento.

6. **Página de Pedidos (Order Page - Dashboard do Usuário - Meus Pedidos)**:
   - Menu lateral: Informações pessoais, Indique e ganhe, Meus pedidos, Minha lista de desejos, Sair.
   - Tabela: ID do pedido, data, preço, status (Pago, Enviado). Clicável para detalhes.
   - Input de busca para pedidos.
   - Responsivo: Tabela rola horizontalmente no mobile.

7. **Página de Informações Pessoais (Personal Information Page - Dashboard do Usuário)**:
   - Menu lateral como acima.
   - Formulário: Upload de foto de perfil, nome, email, telefone, data de nascimento, endereço. Botão editar/salvar.
   - Seção de alteração de senha.
   - Responsivo: Formulários empilham.

8. **Páginas de Autenticação (Login, Registro, Esqueci Senha, etc.)**:
   - Formulário centralizado: Inputs de email/senha, botão de login com Google.
   - Variantes: Desktop página completa, mobile simplificado.
   - Registro: Campos adicionais (nome, telefone).
   - Esqueci: Input de email, enviar reset.
   - Use Supabase Auth para email/senha e logins sociais.

9. **Página de Suporte (Support Page)**:
   - Informações de contato: Email, telefone, endereço.
   - Políticas: Devolução, Cancelamento, Privacidade (acordeões ou seções).
   - FAQ: Similar à home/produto.
   - Responsivo: Acordeões para mobile.

### Backend e Integração com Supabase
- **Esquema de Banco de Dados (Tabelas do Supabase)**:
  - **carrinho**: Armazena carrinhos de compra (id_carrinho: uuid PK, id_cliente: uuid FK, sessao_id: varchar, data_criacao: timestamp, data_atualizacao: timestamp).
  - **categoria**: Categorias de produtos (id_categoria: uuid PK, nome: varchar, descricao: text, slug: varchar, categoria_pai: uuid FK, ativa: boolean).
  - **cliente**: Usuários/clientes (id_cliente: uuid PK, nome: varchar, email: varchar, senha: text, cpf: char, telefone: varchar, data_cadastro: timestamp, status: varchar).
  - **cupom_desconto**: Cupons de desconto (id_cupom: uuid PK, codigo: varchar, tipo: varchar, valor: numeric, quantidade_total: int, quantidade_usada: int, data_inicio: timestamp, data_fim: timestamp, ativo: boolean).
  - **cupom_usado**: Uso de cupons em pedidos (id_pedido: uuid FK, id_cupom: uuid FK, valor_desconto: numeric).
  - **endereco**: Endereços de clientes (id_endereco: uuid PK, id_cliente: uuid FK, cep: char, logradouro: varchar, numero: varchar, complemento: varchar, bairro: varchar, cidade: varchar, uf: char, tipo: varchar, padrao: boolean).
  - **imagem_produto**: Imagens de produtos (id_imagem: uuid PK, id_produto: uuid FK, url_imagem: text, principal: boolean, ordem: int).
  - **item_carrinho**: Itens no carrinho (id_item: uuid PK, id_carrinho: uuid FK, id_produto: uuid FK, quantidade: int, preco_unitario: numeric).
  - **item_pedido**: Itens em pedidos (id_item_pedido: uuid PK, id_pedido: uuid FK, id_produto: uuid FK, quantidade: int, preco_unitario: numeric, subtotal: numeric).
  - **pagamento**: Pagamentos (id_pagamento: uuid PK, id_pedido: uuid FK, valor: numeric, status: varchar, gateway: varchar, id_transacao_gateway: varchar, data_pagamento: timestamp).
  - **pedido**: Pedidos (id_pedido: uuid PK, id_cliente: uuid FK, id_endereco_entrega: uuid FK, numero_pedido: varchar, data_pedido: timestamp, status: varchar, valor_produtos: numeric, valor_frete: numeric, valor_desconto: numeric, valor_total: numeric, forma_pagamento: varchar, parcelas: int, codigo_rastreio: varchar).
  - **produto**: Produtos (id_produto: uuid PK, nome: varchar, descricao: text, preco: numeric, preco_promocional: numeric, estoque: int, peso: int, largura: int, altura: int, profundidade: int, sku: varchar, imagem_principal: text, ativo: boolean, data_cadastro: timestamp).
  - **produto_categoria**: Junção produto-categoria (id_produto: uuid FK, id_categoria: uuid FK).
- **Sincronização e Responsividade**:
  - Use o cliente JavaScript do Supabase no frontend para assinaturas em tempo real (ex.: via `supabase.realtime` para atualizações de pedidos).
  - Busque dados com queries (ex.: `supabase.from('products').select('*')`).
  - Tempo real: Assine mudanças (ex.: atualizações de estoque disparam refresh do carrinho).
  - Autenticação: Supabase Auth gerencia sessões, tokens. Integre com contexto React para estado do usuário.
- **Operações CRUD (Uso Diário)**:
  - **Create**: Adicionar produto (admin), criar pedido no checkout (POST para backend, inserir em orders, atualizar estoque).
  - **Read**: Buscar produtos para listagem, pedidos do usuário, itens do carrinho (queries com filtros/paginação).
  - **Update**: Editar perfil do usuário, atualizar status do pedido (ex.: via webhook do Stripe), quantidade no carrinho.
  - **Delete**: Remover item do carrinho, cancelar pedido (se pendente).
  - Rotas do Backend: /api/products (GET), /api/cart (POST/GET), /api/orders (POST/GET/PUT), protegidas com middleware de auth do Supabase.
  - Lide com erros de forma graciosa (ex.: alertas de estoque baixo).

### Integração com Stripe
- Use Stripe.js e Elements no frontend para formulários de cartão (seguro, sem necessidade de conformidade PCI).
- Backend: Crie intents de pagamento (/api/payment/create-intent), lide com webhooks para confirmação (/api/stripe/webhook).
- No checkout: Colete cartão, crie intent, confirme pagamento, atualize status do pedido no Supabase.
- Suporte a métodos: Cartão (Visa, Master), potencialmente outros via dashboard do Stripe.
- Modo de teste inicialmente, com chaves sandbox.

### Notas Gerais de Implementação
- **Framework/Pilha de Tecnologia**: React (com hooks/contexto), React Router para navegação. Backend: Express, SDK Supabase, SDK Stripe. Implante no Vercel/Netlify (frontend) e Render/Heroku (backend).
- **Desempenho**: Carregamento preguiçoso de imagens, use memoização para componentes. Scroll infinito para produtos.
- **Segurança**: Sanitize inputs, use HTTPS, segurança em nível de linha do Supabase para dados do usuário.
- **Testes**: Testes unitários para componentes, integração para chamadas de API.
- **SEO**: Tags meta, sitemap para páginas como produtos/home.

Implemente isso como uma app completa, pronta para produção, correspondendo pixel-perfect aos designs do Figma. Se houver necessidade de esclarecimentos, assuma com base em melhores práticas de e-commerce padrão.

## Seção Frontend

### Diretrizes Gerais de Estilização e Design System
- **Paleta de Cores Principal**:
  - Ouro (#D4AF37): Usado para botões primários, destaques, banners de newsletter e elementos de chamada à ação. Representa luxo e confiança, alinhado à marca automotiva.
  - Branco (#FFFFFF): Fundo principal das páginas para um visual limpo e moderno.
  - Preto (#000000): Texto principal, ícones e elementos de navegação para alto contraste e legibilidade.
  - Roxo Gradiente (#8E2DE2 para #4A00E0): Aplicado em badges de pagamento (ex.: VISA) para adicionar vibrância e diferenciar métodos financeiros.
  - Cinza Sutil (#F5F5F5 para fundos secundários, #A9A9A9 para bordas e placeholders): Para elementos neutros, evitando sobrecarga visual.
  - Vermelho (#FF0000): Para erros, botões de remoção ou alertas, garantindo atenção imediata.
- **Tipografia**:
  - Fonte Principal: Sans-serif como Roboto (ou fallback para Arial/Helvetica) para modernidade.
  - Tamanhos: Cabeçalhos (24-32px, negrito), Texto corpo (14-16px), Labels de formulário (12-14px).
  - Estilos: Negrito para ênfase, itálico para descrições sutis. Line-height: 1.5-1.8 para melhor leitura. Cor padrão: Preto, com ouro para CTAs.
- **Estilizações Globais**:
  - Fundos: Branco com sombras suaves (box-shadow: 0 2px 4px rgba(0,0,0,0.1)) para cards e seções.
  - Bordas: Arredondadas (border-radius: 8-24px) para botões e inputs, promovendo um design amigável.
  - Espaçamentos: Padding 16-32px em containers, margin 16px entre elementos para respiração visual.
  - Responsividade: Use media queries com breakpoints em 1024px (desktop), 768px (tablet) e <768px (mobile). Flexbox/Grid para adaptação: Colunas viram linhas no mobile.
  - Acessibilidade: Contraste WCAG (4.5:1 min.), ARIA labels em ícones/interativos, foco visível em teclados.

### Componentes Reutilizáveis
Construa uma biblioteca de componentes no React usando styled-components ou Tailwind para consistência em todas as interfaces:
- **HeaderComponent**: Barra fixa com banner ouro para newsletter. Inclui logo ELEVEN, nav links (Início, Produtos), ícones (busca, usuário, carrinho). No mobile: Ícone hambúrguer abre drawer menu.
- **FooterComponent**: Dividido em colunas: Logo, listas de links (Início, Peças por Veículo, Categorias, Suporte), formulário de newsletter (input arredondado + botão ouro), links legais e sociais.
- **ButtonComponent**: Variantes: Primário (fundo ouro, texto branco), Secundário (borda ouro, texto ouro). Hover: Opacidade 0.9 ou escurecimento. Tamanhos: Pequeno (padding 8px), Médio (16px).
- **ProductCard**: Card com imagem, título, preço, botão "Adicionar ao Carrinho". Hover: Sombra maior. Responsivo: Largura 100% no mobile.
- **FormInput**: Input text/email com placeholder, borda cinza, foco em ouro. Validação: Borda vermelha em erros.
- **ProgressBar**: Linha horizontal com círculos ouro para etapas (Entrega, Pagamento, Resumo). Ativo: Preenchido em ouro.
- **TestimonialCard**: Citação com estrelas ouro, nome do usuário. Fundo branco com borda ouro.
- **AccordionFAQ**: Itens expansíveis com seta. Conteúdo escondido até clique.
- **OrderTable**: Tabela responsiva com colunas (ID, Data, Preço, Status). No mobile: Usa scroll horizontal ou cards empilhados.

### Funcionalidades e Implementação por Interface
Baseado em todas as interfaces exibidas no Figma (Home, Products, Product Detail, Cart, Checkout variants, Order, Personal Info, Auth pages, Support):
- **Home Page**: Funcionalidades: Carrossel auto-rotativo de produtos (use React Slick), grade de benefícios (Grid 4 colunas desktop, 1 mobile), depoimentos dinâmicos de API, FAQ expansível. Integração: Fetch produtos em destaque do Supabase.
- **Products Page**: Funcionalidades: Busca reativa (debounce input), filtros dropdown/multi-select, grade paginada (use React Infinite Scroll). Integração: Query Supabase com filtros.
- **Product Detail Page**: Funcionalidades: Galeria de imagens (zoom on hover), seletor de quantidade, botão adicionar (atualiza carrinho via state/API). Depoimentos e FAQ carregados por produto. Relacionados: Slider similar ao home.
- **Cart Page**: Funcionalidades: Lista dinâmica (map de itens), stepper (+/-) atualiza total em tempo real, remoção de item, cálculo de frete dropdown. Integração: State local sincronizado com Supabase cart table.
- **Checkout Pages**: Funcionalidades: Formulários validados (React Hook Form), progresso stepwise (navegação condicional), integração Stripe Elements para cartão. Resumo: Review editável. Integração: POST para backend criar order/payment.
- **Order Page**: Funcionalidades: Tabela sortable/searchable, clique abre modal de detalhes. Integração: Fetch orders do Supabase filtrado por user_id.
- **Personal Info Page**: Funcionalidades: Upload de imagem (File API), form editável com save button, password change com confirmação. Integração: Update user no Supabase.
- **Auth Pages**: Funcionalidades: Login/register com validação, Google OAuth, forgot password envia email. Integração: Supabase Auth hooks.
- **Support Page**: Funcionalidades: Acordeões para políticas/FAQ, contato estático. Integração: Nenhum dinâmico, exceto possivelmente fetch de FAQs.

### Notas Adicionais para Frontend
- Estado Global: Use Redux/Context para carrinho, usuário, autenticação.
- Rotas: React Router com guards para páginas autenticadas (ex.: dashboard).
- Performance: Lazy loading para imagens/componentes pesados.
- Testes: Jest para componentes, React Testing Library para interações.

## Seção Backend

### Visão Geral do Backend
O backend será construído com Node.js e Express, atuando como API RESTful para conectar o frontend ao Supabase e Stripe. Todas as rotas serão protegidas onde necessário com middleware de autenticação (usando Supabase JWT). Use CORS para permitir origens do frontend. Estrutura: Pastas para controllers, models (Supabase queries), middlewares, routes. Implante com PM2 para produção.

O esquema de banco de dados fornecido do Supabase (PostgreSQL) é o seguinte, baseado nas tabelas e colunas detalhadas:

- **carrinho**: Armazena carrinhos de compra (id_carrinho: uuid PK, id_cliente: uuid FK, sessao_id: varchar, data_criacao: timestamp, data_atualizacao: timestamp).
- **categoria**: Categorias de produtos (id_categoria: uuid PK, nome: varchar, descricao: text, slug: varchar, categoria_pai: uuid FK, ativa: boolean).
- **cliente**: Usuários/clientes (id_cliente: uuid PK, nome: varchar, email: varchar, senha: text, cpf: char, telefone: varchar, data_cadastro: timestamp, status: varchar).
- **cupom_desconto**: Cupons de desconto (id_cupom: uuid PK, codigo: varchar, tipo: varchar, valor: numeric, quantidade_total: int, quantidade_usada: int, data_inicio: timestamp, data_fim: timestamp, ativo: boolean).
- **cupom_usado**: Uso de cupons em pedidos (id_pedido: uuid FK, id_cupom: uuid FK, valor_desconto: numeric).
- **endereco**: Endereços de clientes (id_endereco: uuid PK, id_cliente: uuid FK, cep: char, logradouro: varchar, numero: varchar, complemento: varchar, bairro: varchar, cidade: varchar, uf: char, tipo: varchar, padrao: boolean).
- **imagem_produto**: Imagens de produtos (id_imagem: uuid PK, id_produto: uuid FK, url_imagem: text, principal: boolean, ordem: int).
- **item_carrinho**: Itens no carrinho (id_item: uuid PK, id_carrinho: uuid FK, id_produto: uuid FK, quantidade: int, preco_unitario: numeric).
- **item_pedido**: Itens em pedidos (id_item_pedido: uuid PK, id_pedido: uuid FK, id_produto: uuid FK, quantidade: int, preco_unitario: numeric, subtotal: numeric).
- **pagamento**: Pagamentos (id_pagamento: uuid PK, id_pedido: uuid FK, valor: numeric, status: varchar, gateway: varchar, id_transacao_gateway: varchar, data_pagamento: timestamp).
- **pedido**: Pedidos (id_pedido: uuid PK, id_cliente: uuid FK, id_endereco_entrega: uuid FK, numero_pedido: varchar, data_pedido: timestamp, status: varchar, valor_produtos: numeric, valor_frete: numeric, valor_desconto: numeric, valor_total: numeric, forma_pagamento: varchar, parcelas: int, codigo_rastreio: varchar).
- **produto**: Produtos (id_produto: uuid PK, nome: varchar, descricao: text, preco: numeric, preco_promocional: numeric, estoque: int, peso: int, largura: int, altura: int, profundidade: int, sku: varchar, imagem_principal: text, ativo: boolean, data_cadastro: timestamp).
- **produto_categoria**: Junção produto-categoria (id_produto: uuid FK, id_categoria: uuid FK).

Todas as operações CRUD devem respeitar esse esquema, usando nomes de tabelas e colunas exatos nas queries do Supabase. Implemente Row Level Security (RLS) no Supabase para restringir acesso (ex.: clientes só acessam seus próprios dados).

### Rotas da API (Estrutura Profissional)
Todas as rotas usam prefixo `/api`. Respostas em JSON com status codes apropriados (200 OK, 400 Bad Request, 401 Unauthorized, 500 Internal Error). Validação de body com Joi ou similar. Use Supabase client para queries (ex.: `supabase.from('tabela').select('*')`).

#### Rotas de Autenticação (/api/auth)
Essas rotas integram com Supabase Auth, mas o esquema usa tabela "cliente" para dados adicionais. Senha é armazenada hashed.
- **POST /api/auth/signup**: Cria novo cliente. Body: { nome, email, senha, cpf, telefone }. Usa Supabase Auth.signup() para auth, depois insert em 'cliente'. Retorna: { cliente, session }.
- **POST /api/auth/login**: Login com email/senha. Body: { email, senha }. Usa Supabase Auth.signInWithPassword(). Retorna: { cliente, session } (join com 'cliente').
- **POST /api/auth/google**: Login OAuth Google. Body: { token }. Integra Supabase Auth.signInWithOAuth(), cria/atualiza 'cliente'.
- **POST /api/auth/forgot-password**: Envia email de reset. Body: { email }. Usa Supabase Auth.resetPasswordForEmail().
- **POST /api/auth/logout**: Logout. Requer auth. Usa Supabase Auth.signOut().
- **GET /api/auth/cliente**: Pega dados do cliente logado. Requer auth. Query: from('cliente').select('*').eq('id_cliente', user.id).

#### Rotas de Produtos (/api/produtos)
- **GET /api/produtos**: Lista produtos com filtros (query params: id_categoria, search, sort, page, limit). Query: from('produto').select('*', { count: 'exact' }).eq('ativo', true).ilike('nome', `%${search}%`).eq('produto_categoria.id_categoria', id_categoria).order(sort).range(page*limit, (page+1)*limit-1). Join com 'produto_categoria' se necessário.
- **GET /api/produtos/:id**: Detalhes de produto. Query: from('produto').select('*').eq('id_produto', id).single(). Inclui join com 'imagem_produto' para urls.
- **POST /api/produtos**: Adiciona produto (admin only). Body: { nome, descricao, preco, preco_promocional, estoque, peso, largura, altura, profundidade, sku, imagem_principal, ativo }. Insert em 'produto'.
- **PUT /api/produtos/:id**: Atualiza produto (admin). Body: Campos a atualizar (ex.: estoque). Update em 'produto'.
- **DELETE /api/produtos/:id**: Deleta produto (admin). Delete em 'produto'.

#### Rotas de Categorias (/api/categorias)
- **GET /api/categorias**: Lista categorias ativas. Query: from('categoria').select('*').eq('ativa', true).
- **GET /api/categorias/:id**: Detalhes de categoria. Query: from('categoria').select('*').eq('id_categoria', id).single().
- **POST /api/categorias**: Adiciona categoria (admin). Body: { nome, descricao, slug, categoria_pai, ativa }. Insert em 'categoria'.
- **PUT /api/categorias/:id**: Atualiza categoria (admin). Body: Campos a atualizar.
- **DELETE /api/categorias/:id**: Deleta categoria (admin).

#### Rotas de Carrinho (/api/carrinho)
- **GET /api/carrinho**: Pega carrinho do cliente ou sessão. Requer auth ou sessao_id. Query: from('carrinho').select('*', { join: 'item_carrinho' }).eq('id_cliente', user.id) ou eq('sessao_id', sessao_id).
- **POST /api/carrinho**: Cria/atualiza carrinho. Body: { id_cliente, sessao_id }. Insert/upsert em 'carrinho'.
- **POST /api/carrinho/itens**: Adiciona item. Body: { id_carrinho, id_produto, quantidade, preco_unitario }. Insert em 'item_carrinho'.
- **PUT /api/carrinho/itens/:id_item**: Atualiza item (quantidade). Body: { quantidade }. Update em 'item_carrinho'.
- **DELETE /api/carrinho/itens/:id_item**: Remove item. Delete em 'item_carrinho'.

#### Rotas de Pedidos (/api/pedidos)
- **GET /api/pedidos**: Lista pedidos do cliente. Requer auth. Query: from('pedido').select('*').eq('id_cliente', user.id).order('data_pedido', { ascending: false }).
- **GET /api/pedidos/:id**: Detalhes de pedido. Requer auth e ownership. Query: from('pedido').select('*', { join: 'item_pedido' }).eq('id_pedido', id).single().
- **POST /api/pedidos**: Cria pedido no checkout. Body: { id_cliente, id_endereco_entrega, numero_pedido, valor_produtos, valor_frete, valor_desconto, valor_total, forma_pagamento, parcelas }. Insert em 'pedido', depois itens em 'item_pedido'. Atualiza estoque em 'produto'.
- **PUT /api/pedidos/:id/status**: Atualiza status (ex.: via webhook). Body: { status, codigo_rastreio }. Update em 'pedido'.
- **DELETE /api/pedidos/:id**: Cancela pedido (se pendente). Update status para 'cancelado' em 'pedido'.

#### Rotas de Pagamentos (/api/pagamentos) - Integração Stripe
- **POST /api/pagamentos/create-intent**: Cria PaymentIntent. Body: { valor, id_pedido }. Usa Stripe paymentIntents.create({ amount: valor * 100, currency: 'BRL' }). Retorna: { clientSecret }. Insert em 'pagamento' com status 'pendente' e gateway 'stripe'.
- **POST /api/pagamentos/confirm**: Confirma pagamento (frontend chama Stripe confirmCardPayment, backend valida). Body: { paymentIntentId, id_pagamento }. Atualiza 'pagamento' com status, id_transacao_gateway, data_pagamento.
- **POST /api/pagamentos/webhook**: Endpoint para webhooks Stripe (verificação de signature). Em 'payment_intent.succeeded', atualiza 'pagamento' e 'pedido' status para 'pago'.

#### Rotas de Clientes (/api/clientes)
- **GET /api/clientes/profile**: Pega perfil. Requer auth. Query: from('cliente').select('*').eq('id_cliente', user.id).single().
- **PUT /api/clientes/profile**: Atualiza perfil. Body: { nome, cpf, telefone, status }. Update em 'cliente'.
- **POST /api/clientes/enderecos**: Adiciona endereço. Body: { cep, logradouro, numero, complemento, bairro, cidade, uf, tipo, padrao }. Insert em 'endereco'.
- **GET /api/clientes/enderecos**: Lista endereços. Query: from('endereco').select('*').eq('id_cliente', user.id).
- **PUT /api/clientes/enderecos/:id**: Atualiza endereço.
- **DELETE /api/clientes/enderecos/:id**: Deleta endereço.

#### Rotas de Cupons (/api/cupons)
- **GET /api/cupons**: Lista cupons ativos. Query: from('cupom_desconto').select('*').eq('ativo', true).gte('data_fim', now()).
- **POST /api/cupons/validar**: Valida cupom em pedido. Body: { codigo, id_pedido }. Verifica 'cupom_desconto', calcula desconto, insert em 'cupom_usado' se válido.

#### Rotas de Imagens (/api/imagens)
- **POST /api/imagens/produto**: Upload de imagem (multipart). Body: { id_produto, url_imagem (ou file), principal, ordem }. Armazena em Supabase Storage, insert em 'imagem_produto'.
- **GET /api/imagens/produto/:id_produto**: Lista imagens de produto. Query: from('imagem_produto').select('*').eq('id_produto', id_produto).order('ordem').

#### Rotas Administrativas (/api/admin) - Protegidas por role admin
- **GET /api/admin/dashboard**: Métricas (total pedidos, clientes). Queries agregadas: count em 'pedido', 'cliente'.
- **POST /api/admin/produtos/bulk**: Importa produtos em massa. Body: Array de produtos.

### Notas Adicionais para Backend
- Middleware: Auth (verifica Supabase JWT), Error Handler global.
- Integração Supabase: Use @supabase/supabase-js client. Implemente real-time subscriptions para atualizações (ex.: estoque, status de pedido).
- Integração Stripe: stripe-node, configure webhooks com raw body. Use 'id_transacao_gateway' para armazenar IDs do Stripe.
- Segurança: Rate limiting (express-rate-limit), validação de inputs, RLS no Supabase (ex.: políticas para 'cliente' acessar apenas seus 'pedido' e 'endereco').
- Logs: Winston ou similar para monitoramento.
- Testes: Jest/Supertest para rotas.