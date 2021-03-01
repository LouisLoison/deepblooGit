# coding: utf-8

"""This script extracts metrics from the database CSV/TSV export
and stores them in another
"""

import data_preprocessing
import filters
import metric_extraction
import pandas as pd


# TODO: Place as much code blocks as possible in functions

# List of the values to store in the destination file
metrics_lines = []
# List of tenders that supposedly do not have metrics
tenders_without_metrics = []
# List of metrics that are not interesting for us
metrics_noise = []

# Destination CSV file
dest_file = "../../test/valueextraction/output_data/extracted_metrics.csv"
# JSON file
json_file = "../../test/valueextraction/output_data/extracted_metrics.json"

# Step 1: Read the first 100 lines of the CSV file
print("Acquiring tenders data...")
tenders_data = pd.read_csv("export-titres-desc-20210113.csv", sep=",", 
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

# Step 3: Apply the extraction function to the titles and descriptions
print("Metrics extraction...")
for i in range(100):
    # From title
    print("Analyzing title {}...".format(i))
    title_metrics, title_noise = metric_extraction.extract_metrics(
        tenders_data["title"].iloc[i],
        return_noise=True
    )

    # Filter metrics on their value
    title_metrics = filters.entity_floor(title_metrics, entity="length", lower_bound=100)
#     print(len(title_metrics))

    # Adding unimportant metrics to the list of metrics noise
    print("Computing noise...")
    for metric in title_noise:
        
        metrics_noise.append([tenders_data["tenderuuid"].iloc[i],
                              tenders_data["title"].iloc[i],
                              metric.surface,
                              metric.value,
                              metric.unit.name,
                              metric.unit.entity,
                              str(metric.to_official()),
                              1,
                              0,
                              1,
                              1])
    print("Computation completed!")
    
    # Saving the information about the titles that do not have metrics
    # (supposedly)
    if not title_metrics:
        tenders_without_metrics.append([
            tenders_data["tenderuuid"].iloc[i],  # uuid
            tenders_data["title"].iloc[i],       # text
            "",                                  # surface
            "",                                  # value
            "",                                  # unit
            "",                                  # entity
            "",                                  # to_official
            1,                                   # is_title
            0,                                   # is_desc
            0,                                   # has_results
            1                                    # is_noise
        ])
    
    for title_metric in title_metrics:
        metrics_lines.append([tenders_data["tenderuuid"].iloc[i],
                              tenders_data["title"].iloc[i],  # text
                              title_metric.surface,
                              title_metric.value,
                              title_metric.unit.name,
                              title_metric.unit.entity,
                              str(title_metric.to_official()),
                              1,  # is_title
                              0,  # is_description
                              1,  # has_results
                              0   # is_noise
                              ])

    print("Analyzing description {}".format(i))
    description_metrics, desc_noise = metric_extraction.extract_metrics(
        tenders_data["description"].iloc[i],
        return_noise=True
    )

    # Filter description metrics on their value
    description_metrics = filters.entity_floor(description_metrics, entity="length", lower_bound=100)
    
    print("Computing noise...")
    for metric in desc_noise:
        
        metrics_noise.append([tenders_data["tenderuuid"].iloc[i],
                              tenders_data["description"].iloc[i],
                              metric.surface,
                              metric.value,
                              metric.unit.name,
                              metric.unit.entity,
                              str(metric.to_official()),
                              0,
                              1,
                              1,
                              1  # is_noise
                              ])
    print("Computation completed!")
    
    # Saving the information about the titles that do not have metrics
    # (supposedly)
    if not description_metrics:
        tenders_without_metrics.append([
            tenders_data["tenderuuid"].iloc[i],   # uuid
            tenders_data["description"].iloc[i],  # text
            "",                                   # surface
            "",                                   # value
            "",                                   # unit
            "",                                   # entity
            "",                                   # to_official
            0,                                    # is_title
            1,                                    # is_desc
            0,                                    # has_results
            1                                     # is_noise
        ])
    
    for description_metric in description_metrics:
        metrics_lines.append([tenders_data["tenderuuid"].iloc[i],
                              tenders_data["description"].iloc[i],  # text
                              description_metric.surface,
                              description_metric.value,
                              description_metric.unit.name,
                              description_metric.unit.entity,
                              str(description_metric.to_official()),
                              0,  # is_title
                              1,  # is_desc
                              1,  # has_results
                              0,  # is_noise
                              ])
    
# print(metrics_lines)
print("Extraction completed!")

# Step 4: Store the metrics in a file
print("Storage...")

# Creating a single list for the metrics we found and the information
# on titles or descriptions that did not return metrics
result_lines = metrics_lines + metrics_noise + tenders_without_metrics

# Defining a dataframe to format the data before storing
columns = ["uuid", "text", "surface", "value", 
           "unit", "entity", "to_official_unit", 
           "is_title", "is_desc", "has_results", "is_noise"]

metrics_df = pd.DataFrame(result_lines,
                          columns=columns)
# print(metrics_df.head())

# Storage
print("Saving to CSV...")
metrics_df.to_csv(dest_file, index=False, sep=",")
# Storage as a JSON file
print("Saving to JSON...")
metrics_df.to_json(json_file, orient="records")
print("Storage completed!")
