import pandas as pd
import re
from pathlib import Path

# Read the Excel file
df = pd.read_excel('Base Dados Catálogo Aplicações Palhetas Ecoflex Suiçatech 2025 (ATUALIZADA).xlsx')

# Clean column names
df.columns = ['marca', 'data_aplicacao', 'conector', 'tamanho_motorista', 'tamanho_passageiro']

# Remove rows with missing data
df = df.dropna(subset=['marca', 'data_aplicacao'])

# Function to parse year range
def parse_year_range(year_str):
    """Parse year range like '1984 → 1993' into (start, end)"""
    if pd.isna(year_str) or not isinstance(year_str, str):
        return None, None
    
    # Clean the string
    year_str = year_str.strip().replace('→', '-').replace('–', '-').replace('>', '-')
    
    # Try to extract years
    years_match = re.findall(r'\d{4}', year_str)
    if not years_match:
        return None, None
    
    if len(years_match) == 1:
        # Single year
        return int(years_match[0]), int(years_match[0])
    else:
        # Range
        start_year = int(years_match[0])
        end_year = int(years_match[-1])
        return start_year, end_year

# Process data
records = []
for idx, row in df.iterrows():
    marca = str(row['marca']).strip() if pd.notna(row['marca']) else None
    ano_inicio, ano_fim = parse_year_range(row['data_aplicacao'])
    conector = str(row['conector']).strip() if pd.notna(row['conector']) else None
    tamanho_motorista = str(int(row['tamanho_motorista'])) if pd.notna(row['tamanho_motorista']) else None
    tamanho_passageiro = str(int(row['tamanho_passageiro'])) if pd.notna(row['tamanho_passageiro']) else None
    
    if not marca or ano_inicio is None:
        continue
    
    # Use marca as modelo (simplified)
    modelo = marca
    
    records.append({
        'marca': marca,
        'modelo': modelo,
        'ano_inicio': ano_inicio,
        'ano_fim': ano_fim,
        'conector': conector,
        'tamanho_motorista': tamanho_motorista,
        'tamanho_passageiro': tamanho_passageiro
    })

# Create SQL INSERT statements
sql_statements = []
sql_statements.append("-- Insert vehicle compatibility data into veiculos_compativeis")
sql_statements.append("-- Generated from Excel catalog\n")

# Generate INSERT statements
for record in records:
    marca = record['marca'].replace("'", "''")
    modelo = record['modelo'].replace("'", "''")
    ano_inicio = record['ano_inicio']
    ano_fim = record['ano_fim'] if record['ano_fim'] else 'NULL'
    conector_val = record['conector'].replace("'", "''") if record['conector'] else None
    conector = f"'{conector_val}'" if conector_val else 'NULL'
    tamanho_motorista = f"'{record['tamanho_motorista']}'" if record['tamanho_motorista'] else 'NULL'
    tamanho_passageiro = f"'{record['tamanho_passageiro']}'" if record['tamanho_passageiro'] else 'NULL'
    
    sql = f"INSERT INTO public.veiculos_compativeis (marca, modelo, ano_inicio, ano_fim, conector, tamanho_motorista, tamanho_passageiro) VALUES ('{marca}', '{modelo}', {ano_inicio}, {ano_fim}, {conector}, {tamanho_motorista}, {tamanho_passageiro});"
    sql_statements.append(sql)

# Write to file
output_file = Path('populate_veiculos_compativeis.sql')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated {len(records)} INSERT statements")
print(f"SQL file saved to: {output_file.absolute()}")
print(f"\nSample records:")
for i, record in enumerate(records[:5]):
    print(f"  {i+1}. {record['marca']} {record['modelo']} ({record['ano_inicio']}-{record['ano_fim']}) - Motorista: {record['tamanho_motorista']}\", Passageiro: {record['tamanho_passageiro']}\"")
