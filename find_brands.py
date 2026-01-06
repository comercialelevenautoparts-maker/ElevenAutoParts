import pandas as pd

file_path = r'c:\Users\TGL Solutions\Desktop\TGL2025\ElevenAutoParts\Base Dados Catálogo Aplicações Palhetas Ecoflex Suiçatech 2025 (ATUALIZADA).xlsx'

df = pd.read_excel(file_path, header=None)

# Find rows that might contain brand names (e.g., ALFA ROMEO, AUDI)
# Brands are often in uppercase or in a specific column.

print("Searching for typical Brand names...")
search_brands = ['ALFA ROMEO', 'AUDI', 'BMW', 'CHEVROLET', 'FIAT', 'FORD', 'HONDA', 'HYUNDAI', 'TOYOTA', 'VOLKSWAGEN']

for brand in search_brands:
    # Search in all cells
    mask = df.apply(lambda row: row.astype(str).str.contains(brand, case=False).any(), axis=1)
    matching_rows = df[mask]
    if not matching_rows.empty:
        print(f"\nFound brand '{brand}' at rows:")
        print(matching_rows.to_string())

# Also check if any column has values that look like brands vs models
print("\nUnique values in first 3 columns (first 100 rows):")
for col in [0, 1, 2]:
    print(f"\nCol {col} unique values:")
    print(df[col].dropna().unique()[:20])

# Check if there are merged cells - pandas sometimes fills them with NaN or keeps the first value.
# Let's see if the first column has long gaps of NaNs after a brand name
