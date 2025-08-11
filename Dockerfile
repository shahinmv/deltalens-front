# Use Node.js 18 alpine as the base image for smaller size
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
# Try bun first, fallback to npm if bun is not available
RUN npm install -g bun || echo "Bun not available, using npm"
RUN (bun install --frozen-lockfile) || (npm ci --only=production)

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine as production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]