#!/bin/sh


echo "Waiting for Elasticsearch..."
sleep 20
until curl -s -u elastic:${ELASTIC_PASSWORD} http://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
  sleep 5
done
echo "Elasticsearch is ready."

curl -s -X PUT "http://elasticsearch:9200/_ilm/policy/app-policy" \
  -u elastic:${ELASTIC_PASSWORD} \
  -H 'Content-Type: application/json' \
  -d @/ilm-policy.json


echo "ILM policy set to 30 days"


curl -s -X PUT "http://elasticsearch:9200/_index_template/services-template" \
  -u elastic:${ELASTIC_PASSWORD} \
  -H 'Content-Type: application/json' \
  -d '{
    "index_patterns": ["*-service-*", "nginx-*", "rabbitmq-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "app-policy"
      }
    }
  }'
  


echo "Setup complete!"
