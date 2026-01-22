
up:
	@docker compose up -d --build
	@sleep 2
	@docker compose -f infra/elk-stack/docker-compose.yml up -d
	@docker compose -f infra/monitoring/docker-compose.yml up -d

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
	@echo "Development (app only, no infra):"
	@echo "  make dev       - Start app services only"
	@echo "  make dev-down  - Stop dev services"
	@echo "  make dev-restart - Restart dev services"
	@echo "  make dev-logs  - Follow dev logs"
	@echo "  make dev-clean - Stop dev and remove volumes"
	@echo "  make dev-re    - Full dev rebuild"
