import pandas as pd

# Load the Excel file
file_path = r'c:\Users\TGL Solutions\Desktop\TGL2025\ElevenAutoParts\Base Dados Catálogo Aplicações Palhetas Ecoflex Suiçatech 2025 (ATUALIZADA).xlsx'

# Try to read the Excel file
try:
    # Read the first sheet
    df = pd.read_excel(file_path, header=None)
    
    # Print the first 30 rows to understand the structure
    print("--- First 30 rows of the Excel file ---")
    print(df.head(30).to_string())
    
    # Check sheet names
    xl = pd.ExcelFile(file_path)
    print(f"\nSheet names: {xl.sheet_names}")
    
except Exception as e:
    print(f"Error reading Excel: {e}")
