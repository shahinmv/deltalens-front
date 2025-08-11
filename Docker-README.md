# DeltaLens Frontend - Docker Setup

This document explains how to run the DeltaLens frontend using Docker.

## Files Overview

- `Dockerfile` - Production build with Nginx
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx configuration for serving the React app
- `.dockerignore` - Files to exclude from Docker build context

## Quick Start

### Production Build

Build and run the production version:

```bash
# Build the Docker image
docker build -t deltalens-frontend .

# Run the container
docker run -p 80:80 deltalens-frontend
```

Or use Docker Compose:

```bash
# Run production build
docker-compose up --build
```

The application will be available at `http://localhost`

### Development Build

For development with hot reload:

```bash
# Run development build with hot reload
docker-compose --profile dev up --build frontend-dev
```

The development server will be available at `http://localhost:8080`

## Docker Commands

### Build Commands

```bash
# Build production image
docker build -t deltalens-frontend .

# Build development image
docker build -f Dockerfile.dev -t deltalens-frontend-dev .

# Build with Docker Compose
docker-compose build
```

### Run Commands

```bash
# Run production container
docker run -p 80:80 deltalens-frontend

# Run development container with volume mounting
docker run -p 8080:8080 -v $(pwd):/app -v /app/node_modules deltalens-frontend-dev

# Run with Docker Compose
docker-compose up
docker-compose up --profile dev  # For development
```

### Management Commands

```bash
# Stop containers
docker-compose down

# View logs
docker-compose logs frontend

# Remove containers and images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

## Environment Configuration

The frontend is configured to connect to the backend at `http://localhost:8000`. 

To change the API base URL, you can:

1. Modify the `API_BASE_URL` in `src/services/api.ts`
2. Use environment variables (requires additional configuration)
3. Use Docker environment variables in docker-compose.yml

## Production Deployment

### Local Deployment
For local production deployment:

1. Ensure the API_BASE_URL points to your production backend
2. Build the production image: `docker build -t deltalens-frontend .`
3. Run the container: `docker run -p 80:80 deltalens-frontend`

### Railway Deployment
The Dockerfile is configured to work with Railway's dynamic port assignment:

1. Railway automatically detects the Dockerfile and builds the image
2. The `start-nginx.sh` script configures nginx to listen on the `$PORT` environment variable
3. If `PORT` is not set, it defaults to port 80 for local development

**Railway-specific files:**
- `nginx-railway.conf` - Nginx template with `$PORT` variable
- `start-nginx.sh` - Startup script that configures the port dynamically
- `Dockerfile.railway` - Alternative Railway-specific Dockerfile (optional)

The main `Dockerfile` now supports both local and Railway deployment out of the box.

## Nginx Configuration

The production build uses Nginx with:

- Gzip compression
- Static asset caching
- Security headers
- SPA routing support (all routes redirect to index.html)

Modify `nginx.conf` to customize the Nginx configuration.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the port mapping if 80 or 8080 are in use
2. **Build failures**: Ensure all dependencies are properly listed in package.json
3. **API connection issues**: Verify the API_BASE_URL in the frontend code
4. **Dependency resolution errors**: The project uses `--legacy-peer-deps` to resolve React version conflicts with `react-tradingview-widget`

### Debugging

```bash
# View container logs
docker logs <container_id>

# Access container shell
docker exec -it <container_id> /bin/sh

# Check nginx configuration
docker exec -it <container_id> nginx -t
```