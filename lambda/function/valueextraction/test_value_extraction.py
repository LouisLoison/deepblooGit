import pandas as pd
from data_preprocessing import process_column, clean_html

# Extracting values from the CSV file
db_data = pd.read_csv("export-titres-desc.tsv", sep=";")

# Removing the HTML tags from the descriptions
process_column("description", db_data, clean_html)

# Print one of the description values
print(db_data["description"][2])
