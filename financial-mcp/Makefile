.PHONY: install test lint run docker-up

install:
	pip install -r requirements.txt

test:
	pytest tests -v

lint:
	ruff check engines tools registry orchestration validation tests

run:
	cd apps/mcp-server && uvicorn main:app --reload --host 0.0.0.0 --port 8000

docker-up:
	docker compose -f infrastructure/docker/docker-compose.yml up --build
