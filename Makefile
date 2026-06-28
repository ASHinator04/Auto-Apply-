.PHONY: bootstrap install dev dev-web dev-api verify check lint format typecheck test build clean docker-build

bootstrap:
	pnpm bootstrap

install:
	pnpm bootstrap

dev:
	pnpm dev

dev-web:
	pnpm dev:web

dev-api:
	pnpm dev:api

verify:
	pnpm verify

check:
	pnpm verify

lint:
	pnpm lint

format:
	pnpm format

typecheck:
	pnpm typecheck

test:
	pnpm test

build:
	pnpm build

clean:
	pnpm clean

docker-build:
	docker compose build
