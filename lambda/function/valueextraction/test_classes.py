import unittest
from classes import *


class TestClassUnit(unittest.TestCase):
    def setUp(self):
        self.unit1 = Unit("kilowatt", "power")
        self.unit2 = Unit("kW", "power")

    def test_attributes(self):
        """Test whether the attributes were correctly assigned"""
        # Test with unit full name
        self.assertEqual(self.unit1.name, "kilowatt")
        self.assertEqual(self.unit1.entity, "power")
        self.assertEqual(self.unit1.ref_unit, "watt")
        self.assertEqual(self.unit1.uri, "en.m.wikipedia.org/wiki/{}".format(self.unit1.name))
        # Test with abbreviated unit
        self.assertEqual(self.unit2.name, "kW")
        self.assertEqual(self.unit2.entity, "power")
        self.assertEqual(self.unit2.ref_unit, "watt")
        self.assertEqual(self.unit2.uri, "en.m.wikipedia.org/wiki/{}".format(self.unit2.name))

        # Test for inadequate entity
        with self.assertRaises(EntityException):
            self.unit3 = Unit("ampere", "time")


class TestClassMetric(unittest.TestCase):
    def setUp(self):
        self.metric = Metric(25.4, "kilowatt", "power", "25kW")

    def test_str(self):
        self.assertEqual(str(self.metric), "25.40 kilowatt")
        # TODO: Assert that units are always written with their full names


if __name__ == '__main__':
    unittest.main()
