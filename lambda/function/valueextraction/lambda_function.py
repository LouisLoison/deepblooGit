"""In this file, I create a python lambda handler to extract metrics
from titles and descriptions"""

import metric_extraction
import json

def lambda_handler(event, context):
    title = event['title']
    description = event['description']
    title_metrics = metric_extraction.extract_metrics(title)
    description_metrics = metric_extraction.extract_metrics(description)
    
    return json.dumps({'title_metrics': title_metrics,
            'description_metrics': description_metrics})
