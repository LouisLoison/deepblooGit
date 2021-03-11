import pytest
import data_preprocessing as dp


@pytest.fixture
def example_date_time_expressions():
    return [
        "Closing Time: 12:00 PM Electrical : Cables - House Wire",
        "End Date 24-11-2020 10:00 AM",
        "Document Download Start Date: 12-nov-2020 09:00 am",
        "Tender closing date: Tuesday, december 8, 2020 3:00:00 pm ist"
    ]


def test_clean_en_time(example_date_time_expressions):
    without_en_time = [dp.clean_date_time(text) for text in example_date_time_expressions]
    assert without_en_time == [
        "Closing Time: time Electrical : Cables - House Wire",
        "End Date 24-11-2020 time",
        "Document Download Start Date: 12-nov-2020 time",
        "Tender closing date: Tuesday, december 8, 2020 time ist"
    ]
