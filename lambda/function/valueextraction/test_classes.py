import unittest


class TestClassMetric(unittest.TestCase):
    def setUp(self):
        self.metric = Metric(25.4, "kilowatt", "power", "25kW")

    def test_init(self):
        self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()
