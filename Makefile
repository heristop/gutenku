.PHONY: help install dev start stop docker-up docker-down server front build test lint clean logs

# Default target
help:
	@echo "Gutenku - Development Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up     Start MongoDB container"
	@echo "  docker-down   Stop MongoDB container"
	@echo "  logs          Show MongoDB container logs"
	@echo ""
	@echo "Development:"
	@echo "  install       Install all dependencies"
	@echo "  dev           Start Docker + server + frontend (full stack)"
	@echo "  server        Start only the API server"
	@echo "  front         Start only the frontend"
	@echo "  start         Start server + frontend (without Docker)"
	@echo ""
	@echo "Build & Test:"
	@echo "  build         Build the frontend for production"
	@echo "  test          Run all tests"
	@echo "  lint          Run linters on all packages"
	@echo ""
	@echo "Utilities:"
	@echo "  setup         Setup books database"
	@echo "  train         Train Markov chain model"
	@echo "  clean         Stop Docker and clean up"

# Install dependencies
install:
	pnpm install

# Docker commands
docker-up:
	docker compose -f packages/server/docker-compose.yaml up -d

docker-down:
	docker compose -f packages/server/docker-compose.yaml down

logs:
	docker compose -f packages/server/docker-compose.yaml logs -f

# Development commands
server:
	pnpm --filter @gutenku/api dev

front:
	pnpm --filter @gutenku/vue dev

# Start both server and frontend (without Docker)
start:
	pnpm dev

# Full stack: Docker + server + frontend
dev: docker-up
	@echo "Waiting for MongoDB to start..."
	@sleep 2
	pnpm dev

# Build frontend for production
build:
	pnpm build

# Run all tests
test:
	pnpm test

# Run linters
lint:
	pnpm lint

# Setup and training
setup:
	pnpm setup

train:
	pnpm train

# Clean up
clean: docker-down
	@echo "Cleaned up Docker containers"
