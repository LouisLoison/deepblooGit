"""
This module implements functions to manipulate numerical values
previously extracted from a text
"""

from pint import UnitRegistry
from xml.sax.expatreader import AttributesImpl
from lib2to3.pytree import convert
from tkinter.test.support import units

ureg = UnitRegistry()


def convert(value, start_unit, dest_unit):
    """
    Converts a value of unit start_unit to unit dest_unit
    
    Attributes
    ----------
    value : float
        value of the measure to convert
        
    start_unit : str
        Initial unit
        
    dest_unit : str
        End unit
        
    Returns
    -------
    new_value, dest_unit
        New value and new unit after conversion
        
    Raises
    ------
    UnitNotFound
    """
    
    # TODO: Handle exception(s)
    
    quant = value * ureg(start_unit)
    quant.ito(dest_unit)
    
    return quant.magnitude, dest_unit


def to_base_unit(value, unit):
    """
    Convert a value of unit unit to its base unit (e.g. from kW to W)
    """
    
    quant = value * ureg(unit)
    quant.ito_base_units()
    
    return quant.magnitude, quant.units