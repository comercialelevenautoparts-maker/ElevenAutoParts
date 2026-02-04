# Estrutura de Conectores - Documentação

## 📋 Visão Geral

Esta documentação explica a estrutura de banco de dados criada para gerenciar conectores de palhetas de limpador de para-brisa e sua relação com veículos compatíveis.

## 🎯 Decisão de Design: Por que Tabela Separada?

### ✅ Vantagens da Abordagem com Tabela Separada

1. **Normalização de Dados**
   - Evita duplicação de URLs de imagens
   - Cada conector é definido uma única vez
   - Reduz o tamanho total do banco de dados

2. **Manutenção Facilitada**
   - Atualizar informações de um conector afeta todos os veículos automaticamente
   - Adicionar novos conectores é simples e centralizado
   - Fácil gerenciar descrições e metadados dos conectores

3. **Performance**
   - Queries mais rápidas com JOINs otimizados
   - Índices eficientes
   - Menor uso de storage

4. **Integridade de Dados**
   - Foreign keys garantem que apenas conectores válidos sejam usados
   - Previne erros de digitação em códigos de conectores
   - Facilita validações

5. **Escalabilidade**
   - Fácil adicionar novos tipos de conectores
   - Permite adicionar mais informações aos conectores no futuro (especificações técnicas, compatibilidades, etc.)

### ❌ Desvantagens de Manter Tudo em Uma Tabela

- Repetição da URL da imagem em cada registro de veículo
- Dificuldade para atualizar informações de conectores
- Maior chance de inconsistências
- Maior uso de espaço em disco
- Queries mais lentas para filtrar por conector

## 🗄️ Estrutura do Banco de Dados

### Tabela: `conectores`

```sql
CREATE TABLE public.conectores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) UNIQUE NOT NULL,        -- Ex: GA, K4, PB
  nome VARCHAR(100) NOT NULL,                 -- Ex: "Conector GA"
  descricao TEXT,                             -- Descrição detalhada
  imagem_url TEXT NOT NULL,                   -- Caminho da imagem
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Conectores Cadastrados:**
- GA, K4, K6, K7, K9, K13, K14, K15, K16, K17, K19
- PB, PB5, PC, PD, PF, PG, PI, PM

### Tabela: `veiculos_compativeis`

```sql
CREATE TABLE public.veiculos_compativeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  conector_id UUID NOT NULL REFERENCES conectores(id),
  tamanho_motorista NUMERIC(4,1),
  tamanho_passageiro NUMERIC(4,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(marca, modelo, ano)
);
```

## 🚀 Como Usar

### 1. Executar as Migrations

```bash
# Primeiro, crie a tabela de conectores
supabase migration up 20260109_create_conectores_table.sql

# Depois, atualize a tabela de veículos
supabase migration up 20260109_update_veiculos_table.sql
```

### 2. Consultas SQL Úteis

#### Buscar veículos com informações do conector
```sql
SELECT 
  v.*,
  c.codigo as conector_codigo,
  c.nome as conector_nome,
  c.imagem_url as conector_imagem
FROM veiculos_compativeis v
JOIN conectores c ON v.conector_id = c.id
WHERE v.marca = 'AUDI'
ORDER BY v.modelo, v.ano;
```

#### Listar todos os conectores com contagem de veículos
```sql
SELECT 
  c.codigo,
  c.nome,
  COUNT(v.id) as total_veiculos
FROM conectores c
LEFT JOIN veiculos_compativeis v ON c.id = v.conector_id
GROUP BY c.id, c.codigo, c.nome
ORDER BY total_veiculos DESC;
```

#### Buscar veículos por tipo de conector
```sql
SELECT v.*
FROM veiculos_compativeis v
JOIN conectores c ON v.conector_id = c.id
WHERE c.codigo = 'GA';
```

### 3. Uso no Frontend (TypeScript/React)

Veja o arquivo `src/examples/conectores-usage-example.ts` para exemplos completos.

#### Exemplo Rápido:
```typescript
// Buscar veículos com informações do conector
const { data } = await supabase
  .from('veiculos_compativeis')
  .select(`
    *,
    conector:conector_id (
      codigo,
      nome,
      imagem_url
    )
  `)
  .eq('marca', 'BMW');

// Exibir imagem do conector
<img src={veiculo.conector.imagem_url} alt={veiculo.conector.nome} />
```

## 📊 Comparação de Abordagens

| Aspecto | Tabela Separada ✅ | Tudo em Uma Tabela ❌ |
|---------|-------------------|---------------------|
| Normalização | Alta | Baixa |
| Manutenção | Fácil | Difícil |
| Performance | Ótima | Regular |
| Integridade | Garantida (FK) | Manual |
| Espaço em Disco | Menor | Maior |
| Escalabilidade | Excelente | Limitada |
| Complexidade Inicial | Média | Baixa |

## 🔄 Migração de Dados Existentes

A migration `20260109_update_veiculos_table.sql` já cuida de:

1. ✅ Renomear `veiculos` para `veiculos_compativeis`
2. ✅ Adicionar coluna `conector_id`
3. ✅ Mapear códigos de conectores existentes para IDs
4. ✅ Criar foreign key constraint
5. ✅ Atualizar índices e políticas RLS
6. ⚠️ Manter coluna `conector` para compatibilidade (opcional removê-la)

## 🎨 Estrutura de Arquivos de Imagens

```
frontend/src/assets/conectores/
├── GA.png
├── K4.png
├── K6.png
├── K7.png
├── K9.png
├── K13.png
├── K14.png
├── K15.png
├── K16.png
├── K17.png
├── K19.png
├── PB.png
├── PB5.png
├── PC.png
├── PD.png
├── PF.png
├── PG.png
├── PI.png
└── PM.png
```

## 🔐 Segurança (RLS)

Ambas as tabelas têm Row Level Security habilitado:
- ✅ Leitura pública permitida
- ❌ Escrita restrita (apenas admin/backend)

## 📝 Próximos Passos

1. Executar as migrations no Supabase
2. Verificar se os dados foram migrados corretamente
3. Atualizar o código frontend para usar a nova estrutura
4. (Opcional) Remover a coluna `conector` antiga após confirmar que tudo funciona
5. Considerar fazer upload das imagens para o Supabase Storage para melhor performance

## 💡 Dicas

- Use sempre JOINs para buscar dados de veículos com conectores
- Aproveite os índices criados para queries rápidas
- Considere criar uma view materializada se houver muitas consultas complexas
- Mantenha as descrições dos conectores atualizadas para melhor UX

## ❓ Dúvidas Frequentes

**P: Posso adicionar novos conectores facilmente?**
R: Sim! Basta inserir um novo registro na tabela `conectores` com a imagem correspondente.

**P: E se eu quiser adicionar mais informações aos conectores?**
R: Adicione novas colunas à tabela `conectores` sem afetar a estrutura de veículos.

**P: A performance vai ser boa com muitos registros?**
R: Sim! Os índices e foreign keys garantem queries rápidas mesmo com milhares de registros.

**P: Posso reverter para a estrutura antiga?**
R: Sim, mas não é recomendado. A coluna `conector` ainda existe para compatibilidade.
