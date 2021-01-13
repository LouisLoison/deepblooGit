# coding: utf-8

"""This script extracts metrics from the database TSV export
and stores them in another
"""

import data_preprocessing
import metric_extraction
import pandas as pd

# List of the values to store in the destination file
metrics_lines = []
# List of tenders that supposedly do not have metrics
tenders_without_metrics = []

# Destination TSV file
dest_file = "tests/output_data/extracted_metrics.tsv"

# Step 1: Read the first 100 lines of the TSV file
print("Acquiring tenders data...")
tenders_data = pd.read_csv("export-titres-desc.tsv", sep=";", 
                           nrows=100)
print("Data acquisition completed!")
# print(tenders_data.head())

# Step 2: Remove the HTML tags from the texts in title and description
print("Removing HTML tags...")
data_preprocessing.process_column("title", 
                                  tenders_data, 
                                  data_preprocessing.clean_html)
# print(tenders_data["title"].head())
data_preprocessing.process_column("description", 
                                  tenders_data, 
                                  data_preprocessing.clean_html)
# print(tenders_data["description"].head())
print("Completed!")

# For the sake of seeing more clearly what is written within the titles
# and descriptions, let's save them in files
# TODO: handle different character sets
with open("tests/output_data/titles.txt", "w") as titles_out, open("tests/output_data/descriptions.txt", "w") as desc_out:
    for i in range(100):
        try:
            titles_out.write(tenders_data["title"][i] + ";\n")
            desc_out.write(tenders_data["description"][i] + ";\n\n")
        except UnicodeEncodeError:
            pass

# Step 3: Apply the extraction function to the titles and descriptions
print("Metrics extraction...")
for i in range(100):
    title_metrics = metric_extraction.extract_metrics(
        tenders_data["title"].iloc[i]
    )
    
    # Saving the information about the tenders that do not have metrics
    # (supposedly)
    if not title_metrics:
        tenders_without_metrics.append([
            tenders_data["tenderuuid"].iloc[i], # uuid
            tenders_data["title"].iloc[i],      # text
            "",                                 # surface
            "",                                 # value
            "",                                 # unit
            "",                                 # entity
            "",                                 # to_official
            1,                                  # is_title
            0,                                  # is_desc
            0                                   # has_results
        ])
    
    for title_metric in title_metrics:
#         print(title_metric.unit.entity)
        metrics_lines.append([tenders_data["tenderuuid"].iloc[i],
                              tenders_data["title"].iloc[i], #text
                              title_metric.surface,
                              title_metric.value,
                              title_metric.unit.name,
                              title_metric.unit.entity,
                              str(title_metric.to_official()),
                              1, # is_title
                              0, # is_description
                              1 # has_results
                              ])
    
    description_metrics = metric_extraction.extract_metrics(
        tenders_data["description"].iloc[i]
    )
    
    for description_metric in description_metrics:
#         print(description_metric.unit.entity)
        metrics_lines.append([tenders_data["tenderuuid"].iloc[i],
                              tenders_data["description"].iloc[i], # text
                              description_metric.surface,
                              description_metric.value,
                              description_metric.unit.name,
                              description_metric.unit.entity,
                              str(description_metric.to_official()),
                              0, # is_title
                              1, # is_description
                              1
                              ])
    
# print(metrics_lines)
print("Extraction completed!")

# Step 4: Store the metrics in a file
print("Storage...")

# Creating a single list for the metrics we found and the information
# on titles or descriptions that did not return metrics
result_lines = metrics_lines.append(tenders_without_metrics)

# Defining a dataframe to format the data before storing
columns = ["uuid", "text", "surface", "value", 
           "unit", "entity", "to_official_unit", 
           "is_title", "is_desc", "has_results"]

metrics_df = pd.DataFrame(result_lines,
                          columns=columns)
# print(metrics_df.head())

# Storage
metrics_df.to_csv(dest_file, index=False, sep=";")
print("Storage completed!")
