"""
This module implements a class Quantity designed specifically
for the needs of the project
"""
from xml.sax.expatreader import AttributesImpl
from builtins import float


class Quantity:
    """Class for a quantity (e.g. 2.5 kW)
    
    Attributes
    ----------
    value : float
        value of the quantity
        
    unit : str
        unit of the quantity
        
    entity : str
        Entity represented by the unit (e.g. energy potential,
        currency...)
        
    uri : str
        WikiPedia URI
    """
    
    def __init__(self, value, unit, entity, uri=None):
        """
        Parameters
        ----------
        value : float
            value of the quantity
        
        unit : str
            unit of the quantity
        
        entity : str
            Entity represented by the unit (e.g. energy potential,
            currency...)
        
        uri : str, optional
            WikiPedia URI
        """
        self.value = value
        self.unit = unit
        self.entity = entity
        self.uri = uri
         
        
    
     