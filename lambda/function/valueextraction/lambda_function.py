"""In this file, I create a python lambda handler to extract metrics
from titles and descriptions"""

import data_preprocessing as dp
import filters
import metric_extraction
import json


def lambda_handler(event, context):
    title = event['title']
    description = event['description']

    # Eliminate date time expressions from text
    title, description = dp.clean_date_time(title), dp.clean_date_time(description)
    title_metrics = metric_extraction.extract_metrics(title)
    description_metrics = metric_extraction.extract_metrics(description)

    # Filter lengths lesser than 100m
    title_metrics = filters.entity_floor(title_metrics)
    description_metrics = filters.entity_floor(description_metrics)
    
    return {'title_metrics': list(map(lambda m: m.to_official().to_dict(),
                                                 title_metrics)),
                       'description_metrics': list(map(lambda m: m.to_official().to_dict(),
                                                       description_metrics))}
