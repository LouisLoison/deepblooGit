"""Numerical Values Extraction

This module implements functions to extract metrics from text
"""

from pint import UnitRegistry
from quantulum3 import parser
from classes import Metric


def extract_values(txt):
    """
    Extract numerical values from the input text
    
    Attributes
    ----------
    txt : str
        Text from which the numerical values are to be extracted
        
    Returns
    -------
    quants
        a list of objects each representing a numerical value
    """
     
    quants = parser.parse(txt)
    
    return quants


def to_metric(quant):
    """Convert a quantulum Quantity object into a
    Metric object (DeepBloo version of Quantity objects)"""
    
    metric = Metric(quant.value, quant.unit.name, quant.unit.entity)
    
    return metric