"""In this module, I implement functions that are useful for other
processes"""

import pandas as pd

unit_references = [
    {'entity': 'power', 'unit': 'W', 'unit_full_name': 'watt'},
    {'entity': 'electrical potential', 'unit': 'V', 'unit_full_name': 'volt'},
    {'entity': 'current', 'unit': 'A', 'unit_full_name': 'ampere'},
    {'entity': 'length', 'unit': 'm', 'unit_full_name': 'meter'},
    {'entity': 'energy', 'unit': 'Wh', 'unit_full_name': 'watt-hour'}
]


def csv_to_json(csv_file_path, json_file_path, sep=","):
    """From an input CSV file, this procedure produces a JSON that is 
    then output to its own file
    
    Attributes
    ----------
    csv_file_path: str
        Original CSV file path
    json_file_path: str
        Destination JSON file path
    sep: str, optional
        Separator used in the CSV file
    """
    
    csv_file = pd.read_csv(csv_file_path, sep=sep)
    csv_file.to_json(json_file_path, orient="records")
