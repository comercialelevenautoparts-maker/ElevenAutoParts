// Database types matching Supabase schema

export interface Profile {
  id: string;
  user_id: string;
  nome: string | null;
  sobrenome: string | null;
  email: string | null;
  cpf: string | null;
  telefone: string | null;
  foto_url: string | null;
  data_nascimento: string | null;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  slug: string;
  categoria_pai: string | null;
  ativa: boolean;
  imagem_url: string | null;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  estoque: number;
  peso: number | null;
  largura: number | null;
  altura: number | null;
  profundidade: number | null;
  sku: string | null;
  imagem_principal: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  ativo: boolean;
  marca: string | null;
  carro: string | null;
  conectores: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProdutoTamanho {
  id: string;
  produto_id: string;
  tamanho: string;
  estoque: number;
}

export interface ProdutoImagem {
  id: string;
  produto_id: string;
  url_imagem: string;
  principal: boolean;
  ordem: number;
}

export interface Endereco {
  id: string;
  user_id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  tipo: string;
  padrao: boolean;
  created_at: string;
}

export interface Carrinho {
  id: string;
  user_id: string | null;
  sessao_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarrinhoItem {
  id: string;
  carrinho_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  tamanho: string | null;
  created_at: string;
  produto?: Produto;
}

export interface Cupom {
  id: string;
  codigo: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  quantidade_total: number | null;
  quantidade_usada: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  created_at: string;
}

export type StatusPedido = 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';
export type StatusPagamento = 'pendente' | 'aprovado' | 'recusado' | 'reembolsado';

export interface Pedido {
  id: string;
  user_id: string | null;
  endereco_id: string | null;
  numero_pedido: string;
  status: StatusPedido;
  valor_produtos: number;
  valor_frete: number;
  valor_desconto: number;
  valor_total: number;
  forma_pagamento: string | null;
  metodo_envio?: string | null;
  parcelas: number;
  codigo_rastreio: string | null;
  cupom_id: string | null;
  created_at: string;
  updated_at: string;
  endereco?: Endereco;
  itens?: PedidoItem[];
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id: string | null;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  tamanho: string | null;
  metadata?: Record<string, any>;
  produto?: Produto;
}

export interface Pagamento {
  id: string;
  pedido_id: string;
  valor: number;
  status: StatusPagamento;
  gateway: string;
  id_transacao_gateway: string | null;
  metodo_pagamento: string | null;
  ultimos_digitos: string | null;
  bandeira: string | null;
  data_pagamento: string | null;
  created_at: string;
}

export interface ListaDesejos {
  id: string;
  user_id: string;
  produto_id: string;
  created_at: string;
  produto?: Produto;
}

export interface Depoimento {
  id: string;
  user_id: string | null;
  nome: string;
  texto: string;
  estrelas: number;
  foto_url: string | null;
  aprovado: boolean;
  produto_id: string | null;
  created_at: string;
}

export interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}
