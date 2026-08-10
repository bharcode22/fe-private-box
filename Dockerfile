# ==========================================
# STAGE 1: Build React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files & install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept Build Arguments for Vite Environment Variables
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_MAX_FREE_USERS
ARG VITE_FREE_USER_QUOTA_BYTES
ARG VITE_FREE_USER_ACTIVE_DAYS

# Export environment variables for Vite compiler
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_MAX_FREE_USERS=$VITE_MAX_FREE_USERS
ENV VITE_FREE_USER_QUOTA_BYTES=$VITE_FREE_USER_QUOTA_BYTES
ENV VITE_FREE_USER_ACTIVE_DAYS=$VITE_FREE_USER_ACTIVE_DAYS

# Build production static bundle
RUN npm run build

# ==========================================
# STAGE 2: Run Application using Node.js Serve
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install lightweight HTTP server for Single Page Apps (SPA)
RUN npm install -g serve

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose container port 3000
EXPOSE 3000

# Start lightweight Node.js web server with SPA routing fallback (-s)
CMD ["serve", "-s", "dist", "-l", "3000"]
