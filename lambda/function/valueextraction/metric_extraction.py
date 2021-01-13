"""Numerical Values Extraction

This module implements functions to extract metrics from text
"""

from pint import UnitRegistry
from quantulum3 import parser
from classes import Metric


def extract_metrics(txt, dimensions=["power", "electrical potential",
                                     "current", "length", "energy"]):
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
        "electrical potential" (eg. 400 kV), "current" (53 A) and 
        "length" (eg. 100m)
        
        All the supported dimensions are referenced in unit_references.csv
        
    Returns
    -------
    quants
        a list of objects each representing a numerical value
    """
    
    # Metric extraction as quantulum3 Quantity objects
    quants = parser.parse(txt)
    # Dimension filtering
    quants = [quant for quant in quants 
              if quant.unit.entity.name in dimensions]
    # Mapping of the Quantity objects to Metric objects
    quants = list(map(quantulum_to_metric, quants))
    
    return quants


def quantulum_to_metric(quant):
    """Convert a quantulum Quantity object into a
    Metric object (DeepBloo version of Quantity objects)"""
    
    metric = Metric(quant.value, # value 
                    quant.unit.name, # unit
                    quant.unit.entity.name, # entity
                    quant.surface # surface
                    )
    
    return metric