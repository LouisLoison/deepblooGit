"""In this file, I implement unit tests related to entity filters"""

from classes import Metric
from filters import entity_floor
import pytest


@pytest.fixture
def example_metric_list():
    return [
        Metric(25.4, "watt", "power", "25.4 W"),
        Metric(15.4, "volt", "electric potential", "15.4 V"),
        Metric(150, "meter", "length", "150 m"),
        Metric(125, "millimeter", "length", "125 mm"),
        Metric(125, "millimeter", "length", "125 mm"),
        Metric(0.25, "centimeter", "length", "0.25 cm"),
        Metric(15, "kilovolt", "electric potential", "15 kV")
    ]


def test_entity_floor(example_metric_list):
    assert entity_floor(example_metric_list) == [
        Metric(25.4, "watt", "power", "25.4 W"),
        Metric(15.4, "volt", "electric potential", "15.4 V"),
        Metric(150, "meter", "length", "150 m"),
        Metric(15, "kilovolt", "electric potential", "15 kV")
    ]
