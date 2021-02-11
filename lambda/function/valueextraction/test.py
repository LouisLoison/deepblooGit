from extraction import extract_values
import manipulation


###################
# Simple sentence #
###################
sent = "The power outage could be avoided by an electrical surge of 15kW \
chanelled through a 150m cable"


# Extract numerical values and store them in a variable
quants = extract_values(sent)
print(quants)

# Print the attributes of the Quantity objects returned
print("Surface :", quants[0].surface)
print("Unit :", quants[0].unit)
print("Position :", quants[0].span)

value = quants[0].value
unit = str(quants[0].unit)
print(unit)

# Convert
print("Base unit :", manipulation.to_base_unit(value, unit))
print("Entity :", quants[0].unit.entity)
print("Compact form :", manipulation.to_compact())


########################
# Import a data source #
########################