"""
This module implements a class Quantity designed specifically
for the needs of the project
"""
from xml.sax.expatreader import AttributesImpl
from builtins import float, None
import pandas as pd


class Metric:
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
        
    surface
    
    
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
        self.surface = None
        
class Unit:
    """Class to represent a unit
    
    Attributes
    ----------
    name: str
        unit name (eg. kilowatt)
    ref_unit: str
        reference unit (eg. watt for kilowatt)
    entity: str
        entity represented by the unit
    uri: str
        WikiPedia URI
    """
    
    unit_references = pd.read_csv("unit_references.csv")
    
    def __init__(self,name,entity,uri):
        self.name = name
        self._entity = entity
        self.ref_unit = None
        self.uri = uri
        
        print(unit_references)
        
    
     def __set_entity__(self, new_entity):
         # When we set the entity, we can use that information
         # to set the reference unit
         self._entity = new_entity
         