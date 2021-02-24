"""Data preprocessing modules created to simplify the preprocessing
steps of future works"""

import pandas as pd
import re


def clean_html(raw_html):
    """Remove HTML tags from a text"""
    
    clean_regex = re.compile('<.*?>')
    clean_text = re.sub(clean_regex, '', raw_html)
    return clean_text


def process_column(column_name, dataframe, process):
    """Define a method to apply the same process to every row in a
    pandas DataFrame column"""

    dataframe[column_name] = pd.DataFrame(map(process, dataframe[column_name]))


def clean_date_time(text, replace_with="time"):
    """Remove date and time expressions from a text and replace them
    with the value of the parameter replace_with"""

    # Remove all time expressions formatted with 'am' and 'pm'
    new_text = re.sub(r"\d{2}:\d{2}\s*[a|A|p|P][m|M]", replace_with, text)
    new_text = re.sub(r"\d{2}:\d{2}:\d{2}\s*[a|A|p|P][m|M]", replace_with, new_text)

    return new_text
