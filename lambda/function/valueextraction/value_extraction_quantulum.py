from quantulum3 import parser


def extract_quantities(text):
	# Return a list of objects of type Quantity from the quantulum3
	# library. Those objects correspond to the numerical values found
	# in the text
	
	quants = parser.parse(text)
	
	return quants
	
	
def find_entities(quants):
	# Find all the entities that appear in a
	# list of objects Quantity
	
	entities = []
	
	for quant in quants:
		if quant.entity not in entities:
			entities.append(quant.entity)
			
	return entities
	
	
def quantities_essential(quants):
	# Return a dictionary with a quantity as value and the
	# corresponding entity as key
	# e.g. 'power': '2kW'
	
	values = {}
	
	# Find all the entities appearing in the list of
	# Quantity
	entities = find_entities(quants)

	# Initialization of the dictionary of values
	for entity in entities:
		values[entity] = []
	
	# Filling the dictionary
	for quant in quants:
		values[quant.entity].append(quant)
		
	return values