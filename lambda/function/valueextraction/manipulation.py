"""
This module implements functions to manipulate metrics
previously extracted from a text
"""

from pint import UnitRegistry

ureg = UnitRegistry()
Q_ = ureg.Quantity

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


# TODO: to fix
def to_base_unit(value, unit):
    """
    Convert a value of unit unit to its base unit (e.g. from kW to W)
    """
    
    quant = value * ureg(unit)
    quant.ito_base_units()
    
    # TODO: Make sure the returned unit is written in a conventional
    # format
    quant.ito_reduced_units()
    print(quant.units)
    
    return quant.magnitude, quant.units


# FIXME
def to_reference_unit(value, unit):
    """Convert a quantity to its reference unit (eg. km to m)
    """
    
    quant = value * ureg(unit)
    
    
def to_compact(value, unit):
    """
    Put the input quantity in a more human readable form 
    """
    quant = Q_(value, unit)
    
    return quant.to_compact()