import pandas as pd

file_path = r'c:\Users\TGL Solutions\Desktop\TGL2025\ElevenAutoParts\Base Dados Catálogo Aplicações Palhetas Ecoflex Suiçatech 2025 (ATUALIZADA).xlsx'

df = pd.read_excel(file_path, header=None)

print(f"Total rows: {len(df)}")

# Check for rows where most cells are NaN - these are often brand headers
print("\nChecking for rows that might be Brand headers (e.g., only one value in the row):")
for i in range(100): # Check first 100 rows
    row = df.iloc[i]
    non_nan = row.dropna()
    if len(non_nan) == 1:
        print(f"Row {i}: {non_nan.values[0]}")

# Also search for 'AUDI' specifically
for i in range(len(df)):
    row_str = " ".join(df.iloc[i].astype(str).tolist())
    if 'AUDI' in row_str.upper():
        print(f"\nFOUND 'AUDI' in Row {i}:")
        print(df.iloc[i].to_dict())
        break

# Let's check row 27 and 28 (where Audi A1/A3 start)
print("\nRows 25-35:")
print(df.iloc[25:36].to_string())
