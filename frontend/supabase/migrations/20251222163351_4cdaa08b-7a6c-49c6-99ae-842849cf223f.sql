-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.status_pedido AS ENUM ('pendente', 'pago', 'enviado', 'entregue', 'cancelado');
CREATE TYPE public.status_pagamento AS ENUM ('pendente', 'aprovado', 'recusado', 'reembolsado');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome VARCHAR(255),
  sobrenome VARCHAR(255),
  email VARCHAR(255),
  cpf CHAR(11),
  telefone VARCHAR(20),
  foto_url TEXT,
  data_nascimento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Categories table
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  categoria_pai UUID REFERENCES public.categorias(id),
  ativa BOOLEAN DEFAULT true,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Products table
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  preco_promocional NUMERIC(10,2),
  estoque INTEGER DEFAULT 0,
  peso INTEGER,
  largura INTEGER,
  altura INTEGER,
  profundidade INTEGER,
  sku VARCHAR(50) UNIQUE,
  imagem_principal TEXT,
  ativo BOOLEAN DEFAULT true,
  marca VARCHAR(100),
  carro VARCHAR(100),
  conectores VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Product categories junction table
CREATE TABLE public.produto_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (produto_id, categoria_id)
);

-- Product images table
CREATE TABLE public.produto_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  url_imagem TEXT NOT NULL,
  principal BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0
);

-- Product sizes table
CREATE TABLE public.produto_tamanhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  tamanho VARCHAR(20) NOT NULL,
  estoque INTEGER DEFAULT 0
);

-- Addresses table
CREATE TABLE public.enderecos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cep CHAR(8) NOT NULL,
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'residencial',
  padrao BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Shopping cart table
CREATE TABLE public.carrinhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sessao_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Cart items table
CREATE TABLE public.carrinho_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrinho_id UUID REFERENCES public.carrinhos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  tamanho VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Discount coupons table
CREATE TABLE public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'percentual' or 'fixo'
  valor NUMERIC(10,2) NOT NULL,
  quantidade_total INTEGER,
  quantidade_usada INTEGER DEFAULT 0,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Orders table
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endereco_id UUID REFERENCES public.enderecos(id),
  numero_pedido VARCHAR(20) UNIQUE NOT NULL,
  status status_pedido DEFAULT 'pendente' NOT NULL,
  valor_produtos NUMERIC(10,2) NOT NULL,
  valor_frete NUMERIC(10,2) DEFAULT 0,
  valor_desconto NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  parcelas INTEGER DEFAULT 1,
  codigo_rastreio VARCHAR(100),
  cupom_id UUID REFERENCES public.cupons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Order items table
CREATE TABLE public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  nome_produto VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tamanho VARCHAR(20)
);

-- Payments table
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status status_pagamento DEFAULT 'pendente' NOT NULL,
  gateway VARCHAR(50) DEFAULT 'stripe',
  id_transacao_gateway VARCHAR(255),
  metodo_pagamento VARCHAR(50),
  ultimos_digitos VARCHAR(4),
  bandeira VARCHAR(20),
  data_pagamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Wishlist table
CREATE TABLE public.lista_desejos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, produto_id)
);

-- Testimonials table
CREATE TABLE public.depoimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome VARCHAR(100) NOT NULL,
  texto TEXT NOT NULL,
  estrelas INTEGER DEFAULT 5 CHECK (estrelas >= 1 AND estrelas <= 5),
  foto_url TEXT,
  aprovado BOOLEAN DEFAULT false,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- FAQ table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(50) DEFAULT 'geral',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_tamanhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrinhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrinho_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_desejos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'nome', new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carrinhos_updated_at
  BEFORE UPDATE ON public.carrinhos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User roles: Only viewable by the user themselves
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone" ON public.categorias
  FOR SELECT USING (true);

-- Products: Public read access for active products
CREATE POLICY "Active products are viewable by everyone" ON public.produtos
  FOR SELECT USING (ativo = true);

-- Product categories: Public read access
CREATE POLICY "Product categories are viewable by everyone" ON public.produto_categorias
  FOR SELECT USING (true);

-- Product images: Public read access
CREATE POLICY "Product images are viewable by everyone" ON public.produto_imagens
  FOR SELECT USING (true);

-- Product sizes: Public read access
CREATE POLICY "Product sizes are viewable by everyone" ON public.produto_tamanhos
  FOR SELECT USING (true);

-- Addresses: Users can CRUD their own addresses
CREATE POLICY "Users can view own addresses" ON public.enderecos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses" ON public.enderecos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.enderecos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.enderecos
  FOR DELETE USING (auth.uid() = user_id);

-- Carts: Users can CRUD their own carts
CREATE POLICY "Users can view own carts" ON public.carrinhos
  FOR SELECT USING (auth.uid() = user_id OR sessao_id IS NOT NULL);

CREATE POLICY "Users can create carts" ON public.carrinhos
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own carts" ON public.carrinhos
  FOR UPDATE USING (auth.uid() = user_id OR sessao_id IS NOT NULL);

CREATE POLICY "Users can delete own carts" ON public.carrinhos
  FOR DELETE USING (auth.uid() = user_id);

-- Cart items: Users can CRUD items in their carts
CREATE POLICY "Users can view cart items" ON public.carrinho_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.carrinhos 
      WHERE id = carrinho_id AND (user_id = auth.uid() OR sessao_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can add cart items" ON public.carrinho_itens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carrinhos 
      WHERE id = carrinho_id AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

CREATE POLICY "Users can update cart items" ON public.carrinho_itens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.carrinhos 
      WHERE id = carrinho_id AND (user_id = auth.uid() OR sessao_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can delete cart items" ON public.carrinho_itens
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.carrinhos 
      WHERE id = carrinho_id AND (user_id = auth.uid() OR sessao_id IS NOT NULL)
    )
  );

-- Coupons: Public read access for active coupons
CREATE POLICY "Active coupons are viewable by everyone" ON public.cupons
  FOR SELECT USING (ativo = true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.pedidos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.pedidos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders" ON public.pedidos
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pendente');

-- Order items: Users can view items of their orders
CREATE POLICY "Users can view own order items" ON public.pedido_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE id = pedido_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items" ON public.pedido_itens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE id = pedido_id AND user_id = auth.uid()
    )
  );

-- Payments: Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.pagamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE id = pedido_id AND user_id = auth.uid()
    )
  );

-- Wishlist: Users can CRUD their own wishlist
CREATE POLICY "Users can view own wishlist" ON public.lista_desejos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON public.lista_desejos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON public.lista_desejos
  FOR DELETE USING (auth.uid() = user_id);

-- Testimonials: Public read for approved, users can create
CREATE POLICY "Approved testimonials are viewable by everyone" ON public.depoimentos
  FOR SELECT USING (aprovado = true);

CREATE POLICY "Users can create testimonials" ON public.depoimentos
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- FAQs: Public read access
CREATE POLICY "Active FAQs are viewable by everyone" ON public.faqs
  FOR SELECT USING (ativo = true);

-- Insert sample categories
INSERT INTO public.categorias (nome, descricao, slug, ativa) VALUES
('Palhetas', 'Palhetas limpador de para-brisa de alta qualidade', 'palhetas', true),
('Conectores', 'Conectores universais e específicos para palhetas', 'conectores', true),
('Borrachas', 'Borrachas de silicone de alta durabilidade', 'borrachas', true),
('Acessórios', 'Acessórios automotivos diversos', 'acessorios', true);

-- Insert sample products
INSERT INTO public.produtos (nome, descricao, preco, preco_promocional, estoque, sku, imagem_principal, ativo, marca, carro, conectores) VALUES
('Palheta Refil Ecoflex', 'Palheta de alta performance com tecnologia Ecoflex para maior durabilidade e limpeza perfeita.', 57.90, 49.99, 150, 'PAL-ECO-001', '/placeholder.svg', true, 'SuzeTech', 'Fiat 2015 a 2022', 'G4'),
('Conector Ecoflex', 'Conector universal de alta resistência compatível com diversos modelos de palhetas.', 47.90, 39.99, 200, 'CON-ECO-001', '/placeholder.svg', true, 'SuzeTech', 'Universal', 'G4'),
('Borracha Silicone Premium', 'Borracha de silicone de alta qualidade para substituição em palhetas.', 29.90, 24.99, 300, 'BOR-SIL-001', '/placeholder.svg', true, 'SuzeTech', 'Universal', null),
('Palheta Flat Blade', 'Palheta flat blade com design aerodinâmico para redução de ruído.', 89.90, 79.99, 100, 'PAL-FLT-001', '/placeholder.svg', true, 'SuzeTech', 'VW Golf 2018+', 'G6'),
('Kit Completo Limpador', 'Kit completo com palhetas, conectores e borrachas de reposição.', 149.90, 129.99, 50, 'KIT-CMP-001', '/placeholder.svg', true, 'SuzeTech', 'Universal', 'Múltiplos'),
('Palheta Traseira Universal', 'Palheta traseira compatível com diversos modelos de veículos.', 39.90, 34.99, 120, 'PAL-TRS-001', '/placeholder.svg', true, 'SuzeTech', 'Universal', 'G3'),
('Conector Adaptador Multi', 'Adaptador multi-conector para compatibilidade estendida.', 19.90, 14.99, 250, 'CON-ADP-001', '/placeholder.svg', true, 'SuzeTech', 'Universal', 'Multi'),
('Borracha Grafitada', 'Borracha grafitada para melhor deslizamento e silêncio.', 34.90, 29.99, 180, 'BOR-GRF-001', '/placeholder.svg', true, 'SuzeTech', 'Universal', null);

-- Link products to categories
INSERT INTO public.produto_categorias (produto_id, categoria_id)
SELECT p.id, c.id FROM public.produtos p, public.categorias c
WHERE (p.sku LIKE 'PAL%' AND c.slug = 'palhetas')
   OR (p.sku LIKE 'CON%' AND c.slug = 'conectores')
   OR (p.sku LIKE 'BOR%' AND c.slug = 'borrachas')
   OR (p.sku LIKE 'KIT%' AND c.slug = 'acessorios');

-- Add product sizes
INSERT INTO public.produto_tamanhos (produto_id, tamanho, estoque)
SELECT id, '22/18', 50 FROM public.produtos WHERE sku LIKE 'PAL%'
UNION ALL
SELECT id, '24/20', 50 FROM public.produtos WHERE sku LIKE 'PAL%'
UNION ALL
SELECT id, '26/16', 50 FROM public.produtos WHERE sku LIKE 'PAL%';

-- Insert sample testimonials
INSERT INTO public.depoimentos (nome, texto, estrelas, aprovado) VALUES
('Mariana Silva', 'Peças com garantia, sempre optei pela busca por modelos de carro e chelle, sempre fui bem atendida. Compra rápida e entrega no prazo.', 5, true),
('Carlos Mendes', 'A Eleven Auto Parts é sensacional! O envolvimento deles ao me ajudar para meu Gol 2008 foi incrível. Entrega rápida e seguinte. Recomendo!', 5, true),
('Emily Silva', 'Atendimento top! Tive dúvidas sobre compatibilidade de uma borracha no meu Corolla, e o suporte me ajudou na hora, muito confiável.', 5, true);

-- Insert sample FAQs
INSERT INTO public.faqs (pergunta, resposta, categoria, ordem, ativo) VALUES
('Posso alterar meu pedido após a confirmação?', 'Sim, você pode alterar seu pedido em até 2 horas após a confirmação, desde que ainda não tenha sido enviado.', 'pedidos', 1, true),
('Como crio uma conta na Eleven Auto Parts?', 'Clique em "Entrar" > "Criar Conta". Preencha com e-mail, CPF e senha. Conta garantem histórico de compras e rastreamento fácil.', 'geral', 2, true),
('Como faço um pedido na Eleven Auto Parts?', 'Navegue pelos produtos, adicione ao carrinho, preencha os dados de entrega e finalize o pagamento de forma segura.', 'pedidos', 3, true),
('Há taxas extras em devoluções?', 'Não há taxas extras. Nós cobrimos o frete de devolução para produtos com defeito.', 'trocas', 4, true),
('Quais formas de pagamento vocês aceitam?', 'Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX e boleto bancário.', 'pagamento', 5, true),
('Como inicio uma troca ou devolução?', 'Acesse sua conta, vá em "Meus Pedidos", selecione o pedido e clique em "Solicitar Troca/Devolução".', 'trocas', 6, true),
('Posso cancelar a assinatura da newsletter?', 'Sim, você pode cancelar a qualquer momento clicando no link de descadastro no rodapé de qualquer e-mail.', 'geral', 7, true),
('Vocês fazem troca de peças?', 'Sim, oferecemos troca de peças dentro de 30 dias após a compra, desde que estejam em perfeitas condições.', 'trocas', 8, true),
('Como rastreio meu pedido?', 'Após o envio, você receberá um código de rastreio por e-mail. Use-o no site dos Correios ou transportadora.', 'envio', 9, true),
('Qual é a política de frete?', 'Oferecemos frete grátis para compras acima de R$ 150. Para valores menores, o frete é calculado pelo CEP.', 'envio', 10, true),
('Meus dados estão seguros na Eleven Auto Parts?', 'Sim, utilizamos criptografia SSL e seguimos as melhores práticas de segurança para proteger seus dados.', 'suporte', 11, true),
('Posso alterar os dados da minha conta?', 'Sim, acesse "Minha Conta" > "Informações Pessoais" para atualizar seus dados a qualquer momento.', 'geral', 12, true);