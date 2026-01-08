.PHONY: all up down restart logs build clean ps \
        elk-up elk-down elk-logs elk-restart \
        monitoring-up monitoring-down monitoring-logs \
        app-up app-down app-logs app-restart \
        all-up all-down all-restart

# Default target
all: all-up

# ============ Application Services ============
app-up:
	docker compose up -d --build

app-down:
	docker compose down

app-logs:
	docker compose logs -f

app-restart: app-down app-up

# ============ ELK Stack ============
elk-up:
	docker compose -f infra/elk-stack/docker-compose.yml up -d

elk-down:
	docker compose -f infra/elk-stack/docker-compose.yml down

elk-logs:
	docker compose -f infra/elk-stack/docker-compose.yml logs -f

elk-restart: elk-down elk-up

# ============ Monitoring (Prometheus + Grafana) ============
monitoring-up:
	docker compose -f infra/monitoring/docker-compose.yml up -d

monitoring-down:
	docker compose -f infra/monitoring/docker-compose.yml down

monitoring-logs:
	docker compose -f infra/monitoring/docker-compose.yml logs -f

# ============ All Services ============
all-up: app-up elk-up monitoring-up
	@echo "All services started"

all-down:
	docker compose down
	docker compose -f infra/elk-stack/docker-compose.yml down
	docker compose -f infra/monitoring/docker-compose.yml down
	@echo "All services stopped"

all-restart: all-down all-up

# ============ Utility Commands ============
build:
	docker compose build --no-cache

ps:
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

clean:
	docker compose down -v
	docker compose -f infra/elk-stack/docker-compose.yml down -v
	docker compose -f infra/monitoring/docker-compose.yml down -v
	docker system prune -f
	@echo "Cleaned up containers and volumes"

# ============ Individual Service Logs ============
logs-gateway:
	docker logs -f api-gateway

logs-user:
	docker logs -f user-service

logs-game:
	docker logs -f game-service

logs-chat:
	docker logs -f chat-service

logs-nginx:
	docker logs -f nginx
