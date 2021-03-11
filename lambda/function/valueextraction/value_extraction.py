import re


def lambda_handler(event, context):
    try:
        values = dict()

        power_regex = r'\d+\w?[W|A|V]'

        powers = re.findall(power_regex, event['title'])
        powers += re.findall(power_regex, event['description'])

        values["puissances"] = powers

        return values
    except:
        print("Failed to extract values.")
