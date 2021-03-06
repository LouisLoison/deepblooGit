"""
This module implements a class Quantity designed specifically
for the needs of the project
"""

from exceptions import EntityException, UnitNotFoundException
from pint import UnitRegistry
from utilities import unit_references, unit_entity_compatibility

# SETTING UP THE MODULE
ureg = UnitRegistry()  # Pint library unit registry
Q_ = ureg.Quantity  # Pint Quantity class


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

    """

    def __init__(self, value, unit_name, entity, surface, uri=""):
        """
        Parameters
        ----------
        value : float
            value of the metric
        
        unit_name : str
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
        self.unit = Unit(unit_name, entity, uri)
        self.surface = surface
        
    def __repr__(self):
        unit_string = "Metric({}, ({}))".format(self.value, self.unit)
        
        return unit_string
    
    def __str__(self):
        return "{:.2f} {}".format(self.value, self.unit.name)

    def __copy__(self):
        return

    def __eq__(self, other):
        if isinstance(other, Metric) and self.unit.entity == other.unit.entity:
            metric_1_in_official = self.to_official().value
            metric_2_in_official = other.to_official().value

            return metric_1_in_official == metric_2_in_official

        return NotImplemented
    
    def to(self, unit_name):
        """Converts a metric to another unit
        
        Parameters
        ----------
        self: Metric
            Metric object
        unit_name: str
            Name of the unit into which the conversion will be done
        
        Returns
        --------
        metric: Metric
            Result of the conversion of the instance to another unit
        """
        
        # Step 1: create a pint Quantity object from our Metric
        # TODO: Not all units can be defined this way. Adapt it
        # so it encompasses all possible definitions
        if self.unit.entity != "currency":
            quantity = Q_("{} {}".format(self.value, self.unit.name))
            
            # Step 2: Convert said Quantity to the reference unit
            quantity.ito(unit_name)
            
            # Step 3: Change the value and the unit of the metric
            metric_instance = Metric(self.value, self.unit.name, self.unit.entity, self.surface)
            metric_instance.value = quantity.magnitude
            metric_instance.unit.name = unit_name
            
            return metric_instance
        
        print("Cannot operate a conversion on this metric unit!")
        return self
    
    def to_official(self):
        """Returns the metric with its unit converted to the official
        one when applied.
        
        When not (for currencies for example), simply returns the Metric
         object as it is
        
        """
        
        # Attempt a conversion in the official unit only when
        # applied
        if self.unit.ref_unit:
            print(self.unit.ref_unit)
            metric_instance = self.to(self.unit.ref_unit)
        
            return metric_instance
        
        return self
    
    def ito_official(self):
        """Modifies the object so that the metric is converted to the
        reference unit"""
        
        metric_instance = self.to_official()
        self.value = metric_instance.value
        self.unit.name = metric_instance.unit.name

    def to_dict(self):
        """Convert an instance of the class Metric to a dictionary"""
        return {'value': self.value, 'unit': self.unit.to_dict(), 'surface': self.surface}
        
        
class Unit:
    """Class to represent a unit
    
    Attributes
    ----------
    name: str
        unit name (eg. kilowatt, A...)
    ref_unit: str
        reference unit full name (eg. watt for kilowatt)
    entity: str
        entity represented by the unit
    uri: str, optional
        WikiPedia URI
    """
    
    def __init__(self, name, entity, uri=""):
        """
        Parameters
        ----------
        name: str
            unit name (eg. kilowatt)
        entity: str
            entity represented by the unit (eg. power, current)
        uri: str, optional
            WikiPedia URI. Defaults to "en.m.wikipedia.org/wiki/[name]"
        """
        # GUARDIANS
        # Guardian 1: All arguments must be of type str
        type_condition = all([isinstance(name, str), isinstance(entity, str), isinstance(uri, str)])

        if not type_condition:
            # If the type of the arguments is wrong, then we cannot proceed
            error_message = "All units must be of type str. " + "Received {}, {} and {} instead.".format(type(name),
                                                                                                         type(entity),
                                                                                                         type(uri))
            raise TypeError(error_message)

        # Guardian 2: Unit name must correspond to an existing unit
        # We will spend time checking whether the unit is in the registry
        # if the corresponding entity is not dimensionless
        if entity != 'dimensionless' and entity in [unit_info['entity'] for unit_info in unit_references]:
            unit_existence = name in ureg  # bool
            if not unit_existence:
                raise UnitNotFoundException(name)

        # Guardian 3: Unit and entity must be compatible
        entity_compatibility = unit_entity_compatibility(name, entity)
        if not entity_compatibility and entity in [unit_info['entity'] for unit_info in unit_references]:
            raise EntityException()

        # Evaluate whether or not we can proceed with the unit instantiation
        # unit_instantiation_ok = all([type_condition,
        #                             unit_existence,
        #                             (entity_compatibility
        #                              or entity not in [unit_info['entity'] for unit_info in unit_references])]
        #                             )
        # if unit_instantiation_ok:
        #     print("Guardians evaluation completed.")
        print("Instantiating object Unit with name {} and entity {}".format(name, entity))

        self.name = name
        self.entity = entity
        # Defaulting the reference unit to handle units that are not
        # in the reference file
        self.ref_unit = ""
        self.uri = "en.m.wikipedia.org/wiki/{}".format(name)
        # TODO: continue to fill the unit reference dictionary
        
        # If the entity is referenced in unit_references, define
        # the value of the reference unit using it
        for unit_reference in unit_references:
            if unit_reference['entity'] == entity:
                self.ref_unit = unit_reference['unit_full_name']
                break

    def __str__(self):
        unit_string = "Unit name: {}\n".format(self.name)
        unit_string += "Entity: {}\n".format(self.entity)
        unit_string += "Reference unit: {}\n".format(self.ref_unit)
        unit_string += "Wikipedia URI: {}\n".format(self.uri)
        
        return unit_string

    def to_dict(self):
        """Convert an instance of the class Unit to a dictionary"""
        return {'unit': self.name, 'entity': self.entity, 'ref_unit': self.ref_unit,
                'uri': self.uri}


if __name__ == "__main__":
    print("Test de la classe Unit")
    unit = Unit("kilowatt", "power")
    print("Unit:", unit.name)
    print("Entity:", unit.entity)
    print("Reference unit:", unit.ref_unit)
    
    print(unit)
    
    print("Test de classe Metric")
    metric = Metric(25.4, "kilowatt", "power", "25kW")
    print(metric)
    # Conversion to another unit
    print(metric.to('mW'))
    # Conversion in the reference unit
    print(metric.to_official())
    print(metric)
    metric.ito_official()
    print(metric)

    print("Defining a unit not referenced in unit_references.csv")
    unit = Unit("Hz", "wavelength")
    print("Unit:", unit.name)
    print("Entity:", unit.entity)
    print("Reference unit:", unit.ref_unit)
