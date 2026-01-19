# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the client (outputs to dist/public)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expose port 8080 (AWS App Runner default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
