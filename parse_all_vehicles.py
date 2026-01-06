import pandas as pd
import re
from pathlib import Path

# Load the Excel file
file_path = r'c:\Users\TGL Solutions\Desktop\TGL2025\ElevenAutoParts\Base Dados Catálogo Aplicações Palhetas Ecoflex Suiçatech 2025 (ATUALIZADA).xlsx'
df = pd.read_excel(file_path, header=None)

# Function to parse year range
def parse_year_range(year_str):
    """Parse year range like '1984 → 1993' into (start, end)"""
    if pd.isna(year_str) or not isinstance(year_str, (str, int, float)):
        return None, None
    
    year_str = str(year_str).strip().replace('→', '-').replace('–', '-').replace('>', '-')
    
    # Extract all 4-digit numbers
    years_match = re.findall(r'\d{4}', year_str)
    if not years_match:
        return None, None
    
    if len(years_match) == 1:
        # Check if it was "Year ->" (ongoing) or just a single year
        if '-' in year_str and year_str.strip().endswith('-'):
             return int(years_match[0]), None # Ongoing
        # If it's just "2010", range is 2010-2010
        return int(years_match[0]), int(years_match[0])
    else:
        # Range
        start_year = int(years_match[0])
        end_year = int(years_match[-1])
        return start_year, end_year

current_brand = None
current_model = None
records = []

print(f"Processing {len(df)} rows...")

for i in range(len(df)):
    row = df.iloc[i]
    val0 = str(row[0]).strip() if pd.notna(row[0]) else None
    
    # Check if this row is a Brand Header
    # A Brand header usually has val0 and the rest are NaN
    cols_with_data = row.dropna()
    
    if val0 and len(cols_with_data) == 1:
        # Skip literal headers
        if val0.upper() in ["MARCA", "DATA DE APLICAÇÃO", "CATALÓGOS", "VEÍCULOS"]:
            continue
        current_brand = val0
        current_model = None # Reset model when brand changes
        # print(f"Detected Brand: {current_brand}")
        continue
    
    # Check if this is a data row
    # Col 1 (Date) must have something
    if pd.notna(row[1]):
        if val0:
            current_model = val0
        
        if not current_brand:
            # Fallback if brand header was missed or structure is different
            current_brand = "Unknown"
            
        ano_inicio, ano_fim = parse_year_range(row[1])
        conector = str(row[2]).strip() if pd.notna(row[2]) else None
        
        # Tamanhos - handle potential floats
        t_m = str(row[3]).strip() if pd.notna(row[3]) else None
        t_p = str(row[4]).strip() if pd.notna(row[4]) else None
        
        # Clean sizes (sometimes they have " or other chars)
        def clean_size(s):
            if not s: return None
            match = re.search(r'\d+', s)
            return match.group(0) if match else s

        records.append({
            'marca': current_brand,
            'modelo': current_model or "Unknown",
            'ano_inicio': ano_inicio,
            'ano_fim': ano_fim,
            'conector': conector,
            'tamanho_motorista': clean_size(t_m),
            'tamanho_passageiro': clean_size(t_p)
        })

print(f"Extracted {len(records)} records.")

# Generate SQL
sql_statements = [
    "-- Full database population for veiculos_compativeis",
    "TRUNCATE TABLE public.veiculos_compativeis;\n"
]

for rec in records:
    # Skip if we couldn't parse the year
    if rec['ano_inicio'] is None:
        continue
        
    # Escape and format values
    marca = rec['marca'].replace("'", "''")
    modelo = rec['modelo'].replace("'", "''")
    ano_inicio = rec['ano_inicio']
    ano_fim = rec['ano_fim'] if rec['ano_fim'] else 'NULL'
    
    conector_val = rec['conector'].replace("'", "''") if rec['conector'] else None
    conector = f"'{conector_val}'" if conector_val else "NULL"
    
    t_m_val = rec['tamanho_motorista']
    t_m = f"'{t_m_val}'" if t_m_val else "NULL"
    
    t_p_val = rec['tamanho_passageiro']
    t_p = f"'{t_p_val}'" if t_p_val else "NULL"
    
    sql = f"INSERT INTO public.veiculos_compativeis (marca, modelo, ano_inicio, ano_fim, conector, tamanho_motorista, tamanho_passageiro) VALUES ('{marca}', '{modelo}', {ano_inicio}, {ano_fim}, {conector}, {t_m}, {t_p});"
    sql_statements.append(sql)

output_path = Path('populate_veiculos_full.sql')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"SQL file generated: {output_path.absolute()}")
print("\nFirst 5 unique brands found:")
brands = sorted(list(set([r['marca'] for r in records])))[:10]
print(brands)
