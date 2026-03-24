import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VeiculoCompativel {
  id: string;
  marca: string;
  modelo: string;
  ano_inicio: number;
  ano_fim: number | null;
  conector: string;
  tamanho_motorista: string;
  tamanho_passageiro: string | null;
  imagem_conector?: string;
  imagem_braco?: string;
  conectores?: {
    imagem_url: string;
    imagem_braco: string | null;
  };
}

export const useMarcas = () => {
  return useQuery({
    queryKey: ['veiculos-marcas'],
    queryFn: async () => {
      let allData: { marca: string }[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      // Loop de paginação para contornar o hard-limit de 1000 do Supabase
      while (hasMore) {
        const { data, error } = await supabase
          .from('veiculos_compativeis')
          .select('marca')
          .order('marca')
          .range(from, from + step - 1);

        if (error) throw error;
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }
        
        // Safety break per evitar loops infinitos
        if (from > 10000) break; 
      }

      // Get unique marcas
      const uniqueMarcas = [...new Set(allData.map(v => v.marca))];
      
      return uniqueMarcas;
    },
  });
};

export const useModelos = (marca: string) => {
  return useQuery({
    queryKey: ['veiculos-modelos', marca],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veiculos_compativeis')
        .select('*')
        .eq('marca', marca)
        .order('modelo')
        .limit(2000);

      if (error) throw error;
      if (!data) return [];

      // Get unique modelos names as strings to prevent React 'Objects are not valid as a React child' crash
      const uniqueModelos: string[] = [...new Set(data.map(item => item.modelo))];

      return uniqueModelos;
    },
    enabled: !!marca,
  });
};

export interface YearMetadata {
  ano: number;
  conector: string;
  tamanho_motorista: string;
  tamanho_passageiro: string | null;
}

export const useAnos = (marca: string, modelo: string) => {
  return useQuery({
    queryKey: ['veiculos-anos', marca, modelo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veiculos_compativeis')
        .select('ano_inicio, ano_fim')
        .eq('marca', marca)
        .eq('modelo', modelo)
        .limit(500);

      if (error) throw error;
      if (!data) return [];

      // Generar lista única de anos decubrindo o intervalo (ano_inicio até ano_fim)
      const currentYear = new Date().getFullYear();
      const seenYears = new Set<number>();

      data.forEach(item => {
        const startYear = item.ano_inicio;
        const endYear = item.ano_fim || currentYear;
        for (let year = startYear; year <= endYear; year++) {
          seenYears.add(year);
        }
      });

      // Retornar apenas a lista de números (anos) ordenada do mais novo para o mais antigo
      return Array.from(seenYears).sort((a, b) => b - a);
    },
    enabled: !!marca && !!modelo,
  });
};

export const useCompatibilidade = (marca: string, modelo: string, ano: number) => {
  return useQuery({
    queryKey: ['veiculos-compatibilidade', marca, modelo, ano],
    queryFn: async () => {
      // Priorizamos a View Correlacionada se ela existir, senão usamos a tabela base
      // Isso resolve o problema de performance e garante que imagens venham juntas
      const { data: veiculoList, error: veiculoError } = await supabase
        .from('veiculos_compativeis')
        .select('*')
        .eq('marca', marca)
        .eq('modelo', modelo)
        .lte('ano_inicio', ano)
        .or(`ano_fim.gte.${ano},ano_fim.is.null`)
        .order('ano_inicio', { ascending: false }); // Pegar o registro mais específico/atual

      if (veiculoError) throw veiculoError;
      
      const veiculoData = veiculoList?.[0];
      if (!veiculoData) return null;

      // Buscar conector e braço na tabela de conectores pelo código
      if (veiculoData.conector) {
        const { data: conectorData } = await (supabase as any)
          .from('conectores')
          .select('imagem_url, imagem_braco')
          .eq('codigo', veiculoData.conector)
          .maybeSingle();

        if (conectorData) {
          return {
            ...veiculoData,
            imagem_conector: conectorData.imagem_url,
            imagem_braco: conectorData.imagem_braco,
            // Adicionado o objeto agrupado que o frontend espera:
            conectores: {
              imagem_url: conectorData.imagem_url,
              imagem_braco: conectorData.imagem_braco
            }
          } as VeiculoCompativel;
        }
      }

      return veiculoData as VeiculoCompativel;
    },
    enabled: !!marca && !!modelo && !!ano,
  });
};
