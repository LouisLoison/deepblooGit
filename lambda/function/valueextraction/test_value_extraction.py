import pandas as pd


raw_data = pd.read_csv("../../data/export-titres-desc.tsv", sep=";")
print(raw_data)