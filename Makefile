
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
