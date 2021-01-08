"""
This module implements a class Quantity designed specifically
for the needs of the project
"""

import pandas as pd


unit_references = pd.read_csv("unit_references.csv")

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
    uri: str, optional
        WikiPedia URI
    """
    
    def __init__(self,name,entity,uri=""):
        self.name = name
        self.entity = entity
        self.ref_unit = unit_references[unit_references.entity == entity]["unit"][0]
        self.uri = uri
        
    
    
if __name__ == "__main__":
    unit = Unit("kilowatt", "power")
    print("Unit:",unit.name)
    print("Entity:", unit.entity)
    print("Reference unit:", unit.ref_unit)
    