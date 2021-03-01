"""
This module implements metrics-related filters

"""

from classes import Metric


def entity_floor(list_of_metrics, entity="length", lower_bound=100):
    """Applies a filter on a list of metrics that removes all metrics whose
    entity is the one defined as argument and for which its value (in the
    official unit) is less than the lower bound

    Examples
    --------
    >>> metric_1 = Metric(12, 'm', 'length')
    >>> metric_2 = Metric(10, 'miles', 'length')
    >>> entity_floor([metric_1, metric_2]) -> [metric_2]

    Parameters
    ----------
    list_of_metrics: list
        List of objects of type Metric
    entity: str, optional
        Entity onto which the filter is based
    lower_bound: int, optional
        Lower bound of the filter

    Returns
    -------
    filtered_list: list
        List of objects Metric with values greater than or equal to the lower bound,
        or of different entity types than the entity refered in parameter
    """

    # TODO: Make sure list_of_metrics is actually a list of objects Metric

    new_list = []

    for metric in list_of_metrics:
        if metric.unit.entity != entity:
            new_list.append(metric)
        else:
            # Convert to the official unit
            metric_in_official = metric.to_official()
            # Compare to lower bound and save in new list if greater
            if metric_in_official.value >= lower_bound:
                new_list.append(metric)

    return new_list
