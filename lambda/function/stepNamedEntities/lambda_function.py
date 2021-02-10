"""In this file, I create a python lambda handler to extract named entities
from titles and descriptions"""

import spacy
nlp = spacy.load("xx_ent_wiki_sm")

def named_entities(text):
    doc = nlp(text)
    return [{
        "start_char": ent.start_char,
        "end_char": ent.end_char,
        "label": ent.label_,
        "text": ent.text} for ent in doc.ents
    ]


def lambda_handler(event, context):
    title = event['title']
    description = event['description']
    title_ents = named_entities(title)
    description_ents = named_entities(description)
    
    return {'title_entities': title_ents,
                       'description_entities': description_ents}

if __name__ == "__main__":
    import sys
    import json
    from pprint import pprint
    with open(sys.argv[1]) as json_file:
        event = json.load(json_file)
        result = lambda_handler(event, {})
        pprint(result)
        json = json.dumps(result, indent=2)
