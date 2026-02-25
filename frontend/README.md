# Eleven Auto Parts - Frontend

## Descrição

Este é o frontend da aplicação Eleven Auto Parts, uma loja online especializada em peças automotivas. O projeto foi desenvolvido com React.js, TypeScript e Vite, seguindo as melhores práticas de desenvolvimento web moderno.

## Tecnologias Utilizadas

- React.js
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase (integração)
- Stripe (integração)

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=seu_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma build de produção
- `npm run preview` - Inicia um servidor de preview local para a build de produção

## Estrutura de Pastas

- `src/` - Código-fonte da aplicação
- `src/components/` - Componentes reutilizáveis
- `src/pages/` - Páginas da aplicação
- `src/hooks/` - Hooks personalizados
- `src/contexts/` - Contextos do React
- `src/integrations/` - Integrações com serviços externos
- `src/assets/` - Arquivos estáticos (imagens, ícones, etc.)

## Funcionalidades

- Catálogo de produtos com filtros e busca
- Sistema de carrinho de compras
- Autenticação de usuários
- Dashboard de pedidos
- Páginas de checkout
- Integração com Supabase para autenticação e banco de dados
- Integração com Stripe para pagamentos

## Componentes UI

O projeto utiliza componentes da biblioteca shadcn/ui com estilos personalizados para manter a consistência visual da marca.
