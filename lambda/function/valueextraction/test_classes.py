import unittest
from classes import *


class TestClassMetric(unittest.TestCase):
    def setUp(self):
        self.metric = Metric(25.4, "kilowatt", "power", "25kW")

    def test_str(self):
        self.assertEqual(str(self.metric), "25.40 kilowatt")
        # TODO: Assert that units are always written with their full names


if __name__ == '__main__':
    unittest.main()
