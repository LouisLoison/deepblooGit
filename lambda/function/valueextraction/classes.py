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
        value of the metric
        
    unit : Unit
        unit of the metric
        
    surface : str
        String that represents how the metric was written 
        in the text it was taken from
        
    uri : str
        WikiPedia URI
        
    surface
    
    
    """
    
    def __init__(self, value, unit, entity, surface, uri=""):
        """
        Parameters
        ----------
        value : float
            value of the metric
        
        unit : str
            name of the unit used for that metric
        
        entity : str
            Entity represented by the unit (e.g. energy potential,
            currency...)
            
        surface: str
            String that represents how the metric was written 
        in the text it was taken from
        
        uri : str, optional
            WikiPedia URI
        """
        self.value = value
        self.unit = Unit(unit,entity,uri)
        self.surface = surface
        
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
        """
        Parameters
        ----------
        name: str
            unit name (eg. kilowatt)
        entity: str
            entity represented by the unit (eg. power, current)
        uri: str, optional
            WikiPedia URI
        """
        self.name = name
        self.entity = entity
        self.ref_unit = unit_references[unit_references.entity == entity]["unit"][0]
        self.uri = uri
        
    def __str__(self):
        unit_string = "{}\n".format(self.name)
        unit_string += "Entity: {}\n".format(self.entity)
        unit_string += "Reference unit: {}n".format(self.ref_unit)
        unit_string += "Wikipedia URI: {}\n".format(self.uri)
        
        return unit_string
        
    
    
if __name__ == "__main__":
    print("Test de la classe Unit")
    unit = Unit("kilowatt", "power")
    print("Unit:",unit.name)
    print("Entity:", unit.entity)
    print("Reference unit:", unit.ref_unit)
    
    print("Test de classe Metric")
    metric = metric(25.4, "kilowatt", "power", "25kW")
    print("")
    