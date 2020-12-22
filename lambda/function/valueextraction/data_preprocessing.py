import pandas as pd
import re


def clean_html(raw_html):
    clean_regex = re.compile('<.*?>')
    clean_text = re.sub(clean_regex, '', raw_html)
    return clean_text


def process_column(column_name, dataframe, process):
    dataframe[column_name] = pd.DataFrame(map(process, dataframe[column_name]))
