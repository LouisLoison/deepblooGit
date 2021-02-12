"""This module defines exceptions specifically geared towards tenders data enhancements"""


class EntityException(Exception):
    def __init__(self):
        Exception.__init__(self, "Defined entity does not match the associated unit")


class UnitNotFoundException(Exception):
    def __init__(self, unit_name):
        Exception.__init__(self, "Unit {} does not exist in the registry.".format(unit_name))
