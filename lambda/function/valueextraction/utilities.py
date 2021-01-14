"""In this module, I implement functions that are useful for other
processes"""

import pandas as pd
import json

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
    