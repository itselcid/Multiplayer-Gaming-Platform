#!/bin/sh


until curl -s -u elastic:${ELASTIC_PASSWORD} http://elasticsearch:9200/_cluster/health > /dev/null; do
  sleep 3
done


curl -X PUT "http://elasticsearch:9200/_ilm/policy/app-policy" \
  -u elastic:${ELASTIC_PASSWORD} \
  -H 'Content-Type: application/json' \
  -d @/ilm-policy.json

echo "ILM policy is set to 30 days"


curl -X PUT "http://elasticsearch:9200/_index_template/services-template" \
  -u elastic:${ELASTIC_PASSWORD} \
  -H 'Content-Type: application/json' \
  -d '{
    "index_patterns": ["*-service-*", "nginx-*", "app-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "app-policy"
      }
    }
  }'

echo "Index template created for all services and linked to ILM policy"
