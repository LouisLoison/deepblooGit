"""Numerical Values Extraction

This module implements functions to extract metrics from text
"""

from quantulum3 import parser


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