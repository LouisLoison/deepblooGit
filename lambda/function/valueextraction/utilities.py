"""In this module, I implement functions that are useful for other
processes"""

import pandas as pd
from pint import UnitRegistry, Context, Unit

unit_references = [
    {'entity': 'power', 'unit': 'W', 'unit_full_name': 'watt'},
    {'entity': 'electrical potential', 'unit': 'V', 'unit_full_name': 'volt'},
    {'entity': 'current', 'unit': 'A', 'unit_full_name': 'ampere'},
    {'entity': 'length', 'unit': 'm', 'unit_full_name': 'meter'},
    {'entity': 'energy', 'unit': 'Wh', 'unit_full_name': 'watt-hour'}
]
# quantulum to pint unit representation dictionary
quantulum_pint_dict = {'volt-ampere': 'volt_ampere'}


def unit_entity_compatibility(unit_name, entity_name):
    """
    Determines a unit and an entity are compatible. Returns True if so,
    False otherwise

    This function assumes that the entity is among the relevant ones (power, electrical potential,
    current, length, energy)

    e.g. unit_entity_compatibility('meter', 'length') ---> True
         unit_entity_compatibility('meter', 'volt') ----> False

    Parameters
    ----------
    unit_name: str
        Unit name (e.g. ampere, volt_ampere...)
    entity_name: str
        Entity name (e.g. power, electrical potential, length...)

    Returns
    -------
    bool:
        True if the unit and the entity match, assuming the entity is among the
        relevant ones. False otherwise or if the entity is irrelevant
    """
    # Determine the reference unit for that entity
    ref_unit = ""
    for unit_info in unit_references:
        if unit_info['entity'] == entity_name:
            ref_unit = unit_info['unit_full_name']

    if len(ref_unit) == 0:
        print("WARNING: Irrelevant entity name. Compatibility could not be evaluated.")
        return False

    return Unit(unit_name).is_compatible_with(Unit(ref_unit), Context())


# TODO: Redefine this function not using pandas
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
