import unittest
from classes import *


class TestClassUnit(unittest.TestCase):
    def setUp(self):
        self.unit = Unit("kilowatt", "power")

    def test_attributes(self):
        """Test whether the attributes were correctly assigned"""
        self.assertEqual(self.unit.name, "kilowatt")
        self.assertEqual(self.unit.entity, "power")
        self.assertEqual(self.unit.ref_unit, "W")

class TestClassMetric(unittest.TestCase):
    def setUp(self):
        self.metric = Metric(25.4, "kilowatt", "power", "25kW")

    def test_str(self):
        self.assertEqual(str(self.metric), "25.40 kilowatt")
        # TODO: Assert that units are always written with their full names

    def test_to(self):
        """Test the conversion of a metric from a unit to another unit"""



if __name__ == '__main__':
    unittest.main()
