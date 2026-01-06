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
    """Parse year range like '1984 → 1993' into list of years"""
    if pd.isna(year_str) or not isinstance(year_str, str):
        return []
    
    # Clean the string
    year_str = year_str.strip().replace('→', '-').replace('–', '-')
    
    # Try to extract years
    years_match = re.findall(r'\d{4}', year_str)
    if not years_match:
        return []
    
    if len(years_match) == 1:
        # Single year
        return [int(years_match[0])]
    else:
        # Range
        start_year = int(years_match[0])
        end_year = int(years_match[-1])
        return list(range(start_year, end_year + 1))

# Process data
records = []
for idx, row in df.iterrows():
    marca = str(row['marca']).strip() if pd.notna(row['marca']) else None
    years = parse_year_range(row['data_aplicacao'])
    conector = str(row['conector']).strip() if pd.notna(row['conector']) else None
    tamanho_motorista = row['tamanho_motorista'] if pd.notna(row['tamanho_motorista']) else None
    tamanho_passageiro = row['tamanho_passageiro'] if pd.notna(row['tamanho_passageiro']) else None
    
    if not marca or not years:
        continue
    
    for year in years:
        records.append({
            'marca': marca,
            'modelo': marca,  # Using marca as modelo for now since Excel doesn't have separate modelo
            'ano': year,
            'conector': conector,
            'tamanho_motorista': tamanho_motorista,
            'tamanho_passageiro': tamanho_passageiro
        })

# Create SQL INSERT statements
sql_statements = []
sql_statements.append("-- Insert vehicle compatibility data")
sql_statements.append("-- Generated from Excel catalog\n")

# Group by unique combinations to avoid duplicates
unique_records = {}
for record in records:
    key = (record['marca'], record['modelo'], record['ano'])
    if key not in unique_records:
        unique_records[key] = record

# Generate INSERT statements
for record in unique_records.values():
    marca = record['marca'].replace("'", "''")
    modelo = record['modelo'].replace("'", "''")
    ano = record['ano']
    conector_val = record['conector'].replace("'", "''") if record['conector'] else None
    conector = f"'{conector_val}'" if conector_val else 'NULL'
    tamanho_motorista = record['tamanho_motorista'] if record['tamanho_motorista'] else 'NULL'
    tamanho_passageiro = record['tamanho_passageiro'] if record['tamanho_passageiro'] else 'NULL'
    
    sql = f"INSERT INTO public.veiculos (marca, modelo, ano, conector, tamanho_motorista, tamanho_passageiro) VALUES ('{marca}', '{modelo}', {ano}, {conector}, {tamanho_motorista}, {tamanho_passageiro});"
    sql_statements.append(sql)

# Write to file
output_file = Path('populate_vehicles.sql')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated {len(unique_records)} INSERT statements")
print(f"SQL file saved to: {output_file.absolute()}")
print(f"\nSample records:")
for i, record in enumerate(list(unique_records.values())[:5]):
    print(f"  {i+1}. {record['marca']} {record['modelo']} ({record['ano']}) - Motorista: {record['tamanho_motorista']}\", Passageiro: {record['tamanho_passageiro']}\"")
