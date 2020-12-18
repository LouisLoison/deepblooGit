curl -X GET 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/api/as/v1/engines/deepbloo-dev/search_settings' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $APPSEARCH_PRIVATE" | jq '.' > search-settings.json

curl -X GET 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/api/as/v1/engines/deepbloo-dev/schema' \
 -H 'Content-Type: application/json' \
 -H "Authorization: Bearer $APPSEARCH_PRIVATE" | jq '.' > schema.json
