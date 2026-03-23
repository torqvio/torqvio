# Docker Setup for Torqvio

This folder contains the Docker configuration for running Torqvio in containers.

## Quick Start

```bash
# From the docker folder
docker-compose up -d

# Or from root
docker/docker-compose up -d
```

## Services

- **postgres**: PostgreSQL database on port 5432
- **redis**: Redis cache on port 6379  
- **backend**: Node.js API on port 8459
- **frontend**: Next.js app on port 7243

## Environment Variables

The Docker setup includes default environment variables. For production:
1. Copy `.env.example` files
2. Update with your secrets
3. Restart containers

## Development

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```
