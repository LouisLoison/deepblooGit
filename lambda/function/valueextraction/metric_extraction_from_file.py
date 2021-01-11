# coding: utf-8

"""This script extracts metrics from the database TSV export
"""

import data_preprocessing
import pandas as pd

# List of the values to store in the destination file
metrics_lines = []

# Step 1: Read the first 100 lines of the TSV file
tenders_data = pd.read_csv("export-titres-desc.tsv", sep=";", 
                           nrows=100)
print(tenders_data.head())

# Step 2: Remove the HTML tags from the texts in title and description
# data_preprocessing.process_column("title", 
#                                   tenders_data, 
#                                   data_preprocessing.clean_html)
# data_preprocessing.process_column("description", 
#                                   tenders_data, 
#                                   data_preprocessing.clean_html)
# print(tenders_data.head())

# Step 3: Apply the extraction function to the titles and descriptions


# 