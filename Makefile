
up:
	@docker network create logging 2>/dev/null || true
	@docker network create network 2>/dev/null || true
	@docker network create monitoring 2>/dev/null || true
	@docker compose -f infra/elk-stack/docker-compose.yml up -d
	@docker compose -f infra/monitoring/docker-compose.yml up -d
	@echo "Waiting for Logstash..."
	@sleep 10
	@docker compose up -d --build

down:
	@docker compose -f infra/monitoring/docker-compose.yml down
	@docker compose -f infra/elk-stack/docker-compose.yml down
	@docker compose down

restart: down up

logs:
	@docker compose logs -f

clean: down
	@docker compose down -v 2>/dev/null || true
	@docker compose -f infra/elk-stack/docker-compose.yml down -v 2>/dev/null || true
	@docker compose -f infra/monitoring/docker-compose.yml down -v 2>/dev/null || true

fclean: clean
	@docker system prune -af --volumes
	@docker network prune -f

re: fclean up



app:
	@docker network create logging 2>/dev/null || true
	@docker network create network 2>/dev/null || true
	@docker network create monitoring 2>/dev/null || true
	@docker compose up -d --build

app-down:
	@docker compose down

app-restart: app-down app

app-logs:
	@docker compose logs -f

app-clean: app-down
	@docker compose down -v 2>/dev/null || true

app-re: app-clean app



dev:
	@docker compose -f docker-compose.dev.yml up -d --build

dev-down:
	@docker compose -f docker-compose.dev.yml down

dev-restart: dev-down dev

dev-logs:
	@docker compose -f docker-compose.dev.yml logs -f

dev-clean: dev-down
	@docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true

dev-re: dev-clean dev


help:
	@echo "Production (full stack with monitoring/ELK):"
	@echo "  make up        - Start all services with infrastructure"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make logs      - Follow logs"
	@echo "  make clean     - Stop and remove volumes"
	@echo "  make fclean    - Full cleanup (prune docker)"
	@echo "  make re        - Full rebuild"
	@echo ""
	@echo "App only (no DevOps tools):"
	@echo "  make app       - Start main app only (no ELK/monitoring)"
	@echo "  make app-down  - Stop app services"
	@echo "  make app-restart - Restart app services"
	@echo "  make app-logs  - Follow app logs"
	@echo "  make app-clean - Stop app and remove volumes"
	@echo "  make app-re    - Full app rebuild"
	@echo ""
	@echo "Development (hot reload, no infra):"
	@echo "  make dev       - Start dev services"
	@echo "  make dev-down  - Stop dev services"
	@echo "  make dev-restart - Restart dev services"
	@echo "  make dev-logs  - Follow dev logs"
	@echo "  make dev-clean - Stop dev and remove volumes"
	@echo "  make dev-re    - Full dev rebuild"
