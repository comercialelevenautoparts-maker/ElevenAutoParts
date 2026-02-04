export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      carrinho_itens: {
        Row: {
          carrinho_id: string
          created_at: string
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          tamanho: string | null
          metadata: Json | null
        }
        Insert: {
          carrinho_id: string
          created_at?: string
          id?: string
          preco_unitario: number
          produto_id: string
          quantidade?: number
          tamanho?: string | null
          metadata?: Json | null
        }
        Update: {
          carrinho_id?: string
          created_at?: string
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          tamanho?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "carrinho_itens_carrinho_id_fkey"
            columns: ["carrinho_id"]
            isOneToOne: false
            referencedRelation: "carrinhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrinho_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      carrinhos: {
        Row: {
          created_at: string
          id: string
          sessao_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          sessao_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          sessao_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativa: boolean | null
          categoria_pai: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          slug: string
        }
        Insert: {
          ativa?: boolean | null
          categoria_pai?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          slug: string
        }
        Update: {
          ativa?: boolean | null
          categoria_pai?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_categoria_pai_fkey"
            columns: ["categoria_pai"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          quantidade_total: number | null
          quantidade_usada: number | null
          tipo: string
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          quantidade_total?: number | null
          quantidade_usada?: number | null
          tipo: string
          valor: number
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          quantidade_total?: number | null
          quantidade_usada?: number | null
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      depoimentos: {
        Row: {
          aprovado: boolean | null
          created_at: string
          estrelas: number | null
          foto_url: string | null
          id: string
          nome: string
          produto_id: string | null
          texto: string
          user_id: string | null
        }
        Insert: {
          aprovado?: boolean | null
          created_at?: string
          estrelas?: number | null
          foto_url?: string | null
          id?: string
          nome: string
          produto_id?: string | null
          texto: string
          user_id?: string | null
        }
        Update: {
          aprovado?: boolean | null
          created_at?: string
          estrelas?: number | null
          foto_url?: string | null
          id?: string
          nome?: string
          produto_id?: string | null
          texto?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depoimentos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      enderecos: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          created_at: string
          id: string
          logradouro: string
          numero: string
          padrao: boolean | null
          tipo: string | null
          uf: string
          user_id: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          created_at?: string
          id?: string
          logradouro: string
          numero: string
          padrao?: boolean | null
          tipo?: string | null
          uf: string
          user_id: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          created_at?: string
          id?: string
          logradouro?: string
          numero?: string
          padrao?: boolean | null
          tipo?: string | null
          uf?: string
          user_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string
          id: string
          ordem: number | null
          pergunta: string
          resposta: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          id?: string
          ordem?: number | null
          pergunta: string
          resposta: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          id?: string
          ordem?: number | null
          pergunta?: string
          resposta?: string
        }
        Relationships: []
      }
      lista_desejos: {
        Row: {
          created_at: string
          id: string
          produto_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          produto_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          produto_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lista_desejos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          bandeira: string | null
          created_at: string
          data_pagamento: string | null
          gateway: string | null
          id: string
          id_transacao_gateway: string | null
          metodo_pagamento: string | null
          pedido_id: string
          status: Database["public"]["Enums"]["status_pagamento"]
          ultimos_digitos: string | null
          valor: number
        }
        Insert: {
          bandeira?: string | null
          created_at?: string
          data_pagamento?: string | null
          gateway?: string | null
          id?: string
          id_transacao_gateway?: string | null
          metodo_pagamento?: string | null
          pedido_id: string
          status?: Database["public"]["Enums"]["status_pagamento"]
          ultimos_digitos?: string | null
          valor: number
        }
        Update: {
          bandeira?: string | null
          created_at?: string
          data_pagamento?: string | null
          gateway?: string | null
          id?: string
          id_transacao_gateway?: string | null
          metodo_pagamento?: string | null
          pedido_id?: string
          status?: Database["public"]["Enums"]["status_pagamento"]
          ultimos_digitos?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          id: string
          metadata: Json | null
          nome_produto: string
          pedido_id: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          subtotal: number
          tamanho: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          nome_produto: string
          pedido_id: string
          preco_unitario: number
          produto_id?: string | null
          quantidade: number
          subtotal: number
          tamanho?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          nome_produto?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          subtotal?: number
          tamanho?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          codigo_rastreio: string | null
          created_at: string
          cupom_id: string | null
          endereco_id: string | null
          forma_pagamento: string | null
          id: string
          numero_pedido: string
          parcelas: number | null
          status: Database["public"]["Enums"]["status_pedido"]
          updated_at: string
          user_id: string | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_produtos: number
          valor_total: number
        }
        Insert: {
          codigo_rastreio?: string | null
          created_at?: string
          cupom_id?: string | null
          endereco_id?: string | null
          forma_pagamento?: string | null
          id?: string
          numero_pedido: string
          parcelas?: number | null
          status?: Database["public"]["Enums"]["status_pedido"]
          updated_at?: string
          user_id?: string | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_produtos: number
          valor_total: number
        }
        Update: {
          codigo_rastreio?: string | null
          created_at?: string
          cupom_id?: string | null
          endereco_id?: string | null
          forma_pagamento?: string | null
          id?: string
          numero_pedido?: string
          parcelas?: number | null
          status?: Database["public"]["Enums"]["status_pedido"]
          updated_at?: string
          user_id?: string | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_produtos?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cupom_id_fkey"
            columns: ["cupom_id"]
            isOneToOne: false
            referencedRelation: "cupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_endereco_id_fkey"
            columns: ["endereco_id"]
            isOneToOne: false
            referencedRelation: "enderecos"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_categorias: {
        Row: {
          categoria_id: string
          id: string
          produto_id: string
        }
        Insert: {
          categoria_id: string
          id?: string
          produto_id: string
        }
        Update: {
          categoria_id?: string
          id?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_categorias_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_imagens: {
        Row: {
          id: string
          ordem: number | null
          principal: boolean | null
          produto_id: string
          url_imagem: string
        }
        Insert: {
          id?: string
          ordem?: number | null
          principal?: boolean | null
          produto_id: string
          url_imagem: string
        }
        Update: {
          id?: string
          ordem?: number | null
          principal?: boolean | null
          produto_id?: string
          url_imagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_imagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_tamanhos: {
        Row: {
          estoque: number | null
          id: string
          produto_id: string
          tamanho: string
        }
        Insert: {
          estoque?: number | null
          id?: string
          produto_id: string
          tamanho: string
        }
        Update: {
          estoque?: number | null
          id?: string
          produto_id?: string
          tamanho?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_tamanhos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          altura: number | null
          ativo: boolean | null
          carro: string | null
          conectores: string | null
          created_at: string
          descricao: string | null
          estoque: number | null
          id: string
          imagem_principal: string | null
          largura: number | null
          marca: string | null
          nome: string
          peso: number | null
          preco: number
          preco_promocional: number | null
          profundidade: number | null
          sku: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          altura?: number | null
          ativo?: boolean | null
          carro?: string | null
          conectores?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number | null
          id?: string
          imagem_principal?: string | null
          largura?: number | null
          marca?: string | null
          nome: string
          peso?: number | null
          preco: number
          preco_promocional?: number | null
          profundidade?: number | null
          sku?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          altura?: number | null
          ativo?: boolean | null
          carro?: string | null
          conectores?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number | null
          id?: string
          imagem_principal?: string | null
          largura?: number | null
          marca?: string | null
          nome?: string
          peso?: number | null
          preco?: number
          preco_promocional?: number | null
          profundidade?: number | null
          sku?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          foto_url: string | null
          id: string
          nome: string | null
          sobrenome: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos_compativeis: {
        Row: {
          ano_fim: number | null
          ano_inicio: number
          conector: string
          created_at: string
          id: string
          marca: string
          modelo: string
          tamanho_motorista: string
          tamanho_passageiro: string | null
        }
        Insert: {
          ano_fim?: number | null
          ano_inicio: number
          conector: string
          created_at?: string
          id?: string
          marca: string
          modelo: string
          tamanho_motorista: string
          tamanho_passageiro?: string | null
        }
        Update: {
          ano_fim?: number | null
          ano_inicio?: number
          conector?: string
          created_at?: string
          id?: string
          marca?: string
          modelo?: string
          tamanho_motorista?: string
          tamanho_passageiro?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      status_pagamento: "pendente" | "aprovado" | "recusado" | "reembolsado"
      status_pedido: "pendente" | "pago" | "enviado" | "entregue" | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      status_pagamento: ["pendente", "aprovado", "recusado", "reembolsado"],
      status_pedido: ["pendente", "pago", "enviado", "entregue", "cancelado"],
    },
  },
} as const
