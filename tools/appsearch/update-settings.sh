curl -X PUT 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/api/as/v1/engines/deepbloo-dev/search_settings' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $APPSEARCH_PRIVATE"\
 -d "$(cat search-settings.json)" | jq '.'


# echo $ERROR |jq '.'|cut -d' ' -f 10

curl -X POST 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/api/as/v1/engines/deepbloo-dev/schema' \
 -H 'Content-Type: application/json' \
 -H "Authorization: Bearer $APPSEARCH_PRIVATE" \
 -d "$(cat schema.json)"  | jq '.'
