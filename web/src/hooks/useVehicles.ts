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
}

export const useMarcas = () => {
  return useQuery({
    queryKey: ['veiculos-marcas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veiculos_compativeis')
        .select('marca')
        .order('marca');

      if (error) throw error;

      // Get unique marcas
      const uniqueMarcas = [...new Set(data.map(v => v.marca))];
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
        .order('modelo');

      if (error) throw error;

      // Get unique modelos by name, keeping the first occurrence (usually the one with lowest id or alphabetical order of other fields)
      const uniqueModelos: VeiculoCompativel[] = [];
      const seenModelos = new Set<string>();

      data.forEach(item => {
        if (!seenModelos.has(item.modelo)) {
          uniqueModelos.push(item as VeiculoCompativel);
          seenModelos.add(item.modelo);
        }
      });

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
        .select('ano_inicio, ano_fim, conector, tamanho_motorista, tamanho_passageiro')
        .eq('marca', marca)
        .eq('modelo', modelo);

      if (error) throw error;

      // Generate list of years from ranges with metadata
      const currentYear = new Date().getFullYear();
      const yearsData: YearMetadata[] = [];
      const seenYears = new Set<number>();

      data.forEach(item => {
        const startYear = item.ano_inicio;
        const endYear = item.ano_fim || currentYear;
        for (let year = startYear; year <= endYear; year++) {
          if (!seenYears.has(year)) {
            yearsData.push({
              ano: year,
              conector: item.conector,
              tamanho_motorista: item.tamanho_motorista,
              tamanho_passageiro: item.tamanho_passageiro
            });
            seenYears.add(year);
          }
        }
      });

      return yearsData.sort((a, b) => b.ano - a.ano);
    },
    enabled: !!marca && !!modelo,
  });
};

export const useCompatibilidade = (marca: string, modelo: string, ano: number) => {
  return useQuery({
    queryKey: ['veiculos-compatibilidade', marca, modelo, ano],
    queryFn: async () => {
      const { data: veiculoData, error: veiculoError } = await supabase
        .from('veiculos_compativeis')
        .select('*')
        .eq('marca', marca)
        .eq('modelo', modelo)
        .lte('ano_inicio', ano)
        .or(`ano_fim.gte.${ano},ano_fim.is.null`)
        .single();

      if (veiculoError) throw veiculoError;

      // Fetch connector image using the code
      if (veiculoData && veiculoData.conector) {
        const { data: conectorData } = await (supabase as any)
          .from('conectores')
          .select('imagem_url')
          .eq('codigo', veiculoData.conector)
          .single();

        if (conectorData) {
          return {
            ...veiculoData,
            imagem_conector: conectorData.imagem_url
          } as VeiculoCompativel;
        }
      }

      return veiculoData as VeiculoCompativel;
    },
    enabled: !!marca && !!modelo && !!ano,
  });
};
