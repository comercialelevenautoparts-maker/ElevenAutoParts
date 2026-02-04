// Script para verificar e popular o banco de dados com dados de exemplo
import { supabase } from '@/integrations/supabase/client';

// Dados de exemplo que você mostrou
const sampleData = [
  {
    marca: "VOLKSWAGEN",
    modelo: "Brasilia",
    ano_inicio: 1973,
    ano_fim: 1982,
    conector: "GA",
    tamanho_motorista: "16",
    tamanho_passageiro: "16"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Parati",
    ano_inicio: 1982,
    ano_fim: 2012,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "18"
  },
  {
    marca: "ALFA ROMEO",
    modelo: "147",
    ano_inicio: 2003,
    ano_fim: 2005,
    conector: "GA",
    tamanho_motorista: "22",
    tamanho_passageiro: "16"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Passat",
    ano_inicio: 2015,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "26",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Caminhões VW",
    ano_inicio: 1992,
    ano_fim: 2000,
    conector: "GA",
    tamanho_motorista: "24",
    tamanho_passageiro: "24"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Saveiro",
    ano_inicio: 1982,
    ano_fim: null,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Apollo",
    ano_inicio: 1990,
    ano_fim: 1992,
    conector: "GA",
    tamanho_motorista: "16",
    tamanho_passageiro: "16"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Up!",
    ano_inicio: 2014,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "24",
    tamanho_passageiro: "16"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Fusca New Beetle",
    ano_inicio: 2000,
    ano_fim: null,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "20"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Bora",
    ano_inicio: 2002,
    ano_fim: 2011,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "SpaceFox",
    ano_inicio: 2006,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "22",
    tamanho_passageiro: "14"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Fox",
    ano_inicio: 2003,
    ano_fim: null,
    conector: "GA",
    tamanho_motorista: "22",
    tamanho_passageiro: "14"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Jetta",
    ano_inicio: 2006,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "24",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "T-Cross",
    ano_inicio: 2019,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "24",
    tamanho_passageiro: "18"
  },
  {
    marca: "ALFA ROMEO",
    modelo: "156",
    ano_inicio: 1997,
    ano_fim: 2005,
    conector: "GA",
    tamanho_motorista: "22",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Virtus",
    ano_inicio: 2017,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "26",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Santana",
    ano_inicio: 1984,
    ano_fim: 2006,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "20"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Golf",
    ano_inicio: 1987,
    ano_fim: null,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "18"
  },
  {
    marca: "VOLVO",
    modelo: "440",
    ano_inicio: 1988,
    ano_fim: 1996,
    conector: "GA",
    tamanho_motorista: "20",
    tamanho_passageiro: "20"
  },
  {
    marca: "VOLKSWAGEN",
    modelo: "Taos",
    ano_inicio: 2021,
    ano_fim: null,
    conector: "PG",
    tamanho_motorista: "26",
    tamanho_passageiro: "18"
  }
];

async function populateDatabase() {
  try {
    console.log('Iniciando verificação/população do banco de dados...');
    
    // Verificar se já existem dados
    const { count, error: countError } = await supabase
      .from('veiculos_compativeis')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Erro ao contar registros:', countError);
      return;
    }

    console.log(`Número atual de registros: ${count}`);

    if (count === 0) {
      console.log('Nenhum registro encontrado. Inserindo dados de exemplo...');
      
      // Inserir os dados de exemplo
      const { data, error } = await supabase
        .from('veiculos_compativeis')
        .insert(sampleData);

      if (error) {
        console.error('Erro ao inserir dados:', error);
      } else {
        console.log('Dados inseridos com sucesso!');
      }
    } else {
      console.log('Banco de dados já contém dados.');
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
populateDatabase();