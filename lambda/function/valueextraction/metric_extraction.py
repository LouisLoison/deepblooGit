"""Numerical Values Extraction

This module implements functions to extract metrics from text
"""

import csv
import pint
import traceback
from classes import Metric
from quantulum3 import parser
from utilities import quantulum_pint_dict, unit_references

# Setting up pint utilities
ureg = pint.UnitRegistry()
Q_ = ureg.Quantity

# Defining the default supported dimensions
ref_dimensions = [unit_info["entity"] for unit_info in unit_references]
ref_dimensions.append("currency")
print(ref_dimensions)


def extract_metrics(txt, dimensions=ref_dimensions,
                    return_noise=False):
    """
    Extract metrics from the input text
    Only metrics representing the input dimensions are selected
    
    
    Attributes
    ----------
    txt : str
        Text from which the numerical values are to be extracted
    dimensions: list, optional
        List of dimensions (entities). Only metrics representing those
        dimensions are selected within text
        
        By default, the supported dimensions are "power" (eg. 25.4 W), 
        "electric potential" (eg. 400 kV), "current" (53 A),
        "length" (eg. 100m), "energy" (5 Wh) and "currency" (5 $)
        
        All the supported dimensions are referenced in unit_references.csv
    return_noise: bool, optional, default=False
        If set to true, return a second list containing all the metrics
        that were not selected using the list of dimensions
        
    Returns
    -------
    quants

        a list of objects each representing a numerical value
    """
    
    # Metric extraction as quantulum3 Quantity objects
    quants = list(parser.parse(txt))
    quants_of_interest = []
    noise = []
    
    # Dimension filtering
    for quant in quants:
        if quant.unit.entity.name in dimensions:
            quants_of_interest.append(quant)
            
        elif return_noise:
            noise.append(quant)
            
            
#     quants = [quant for quant in quants 
#               if quant.unit.entity.name in dimensions]
    # Mapping of the Quantity objects to Metric objects
    quants_of_interest = list(filter(lambda x: x, map(lambda x: quantulum_to_metric(x, True),
                                  quants_of_interest)))
    if not return_noise:
        return quants_of_interest
    else:
        noise = list(map(lambda x: quantulum_to_metric(x, False),
                         noise))
        return quants_of_interest, noise
    

def quantulum_to_metric(quant, relevant):
    """Convert a quantulum Quantity object into a
    Metric object (DeepBloo version of Quantity objects)"""
    # Since pint is the module that later manipulates the metrics,
    # the quantulum Quantity object is first converted to a pint object
    # Said conversion is done to check whether or not the unit name is
    # consistent with pint

    unit_name = quant.unit.name

    if relevant and quant.unit.entity.name != "currency":
        # Naming units after pint ways eases further
        # processes
        try:
            quant_pint_version = Q_("{} {}".format(quant.value,
                                                   quant.unit.name))
            unit_name = str(quant_pint_version.units)
        except pint.errors.DimensionalityError:
            unit_name = quantulum_pint_dict[quant.unit.name]

    try:
        metric = Metric(quant.value,  # value
                    unit_name,  # unit
                    quant.unit.entity.name,  # entity
                    quant.surface  # surface
                    )
    except:
        traceback.print_exc()
        metric = False
        pass
    
    return metric


# TODO: Decorator to ensure csv_path is a CSV file
# TODO: Decorator to ensure the CSV file follows the defined structure
def extract_metrics_from_csv(csv_path, save_json=True):
    """Extract metrics from a CSV file.

    The CSV file ought to respect the following
    structure for its fields:
    tenderuuid, title, description

    Parameters
    ----------
    csv_path: str
        path to the CSV file
    save_json: bool, optional, default=True
        When set to True, the result of the function
        is saved to a JSON file

    Returns
    -------
    metrics_dict: dict
        Dictionary with information on:
        - the relevant metrics retrieved by the function
        - the metrics considered as noise
        - the titles supposedly without metrics
        - the descriptions supposedly without metrics
    """

    # Setup: open the CSV file
    csv_file = open(csv_path)
    tenders = csv.DictReader(csv_file)
