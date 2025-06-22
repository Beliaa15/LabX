# Use Node.js 18 with more memory
FROM node:18-alpine

# Set memory limits and npm configuration
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

# Install dependencies for both frontend and backend
# Copy package files first for better layer caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install backend dependencies first (smaller, less memory intensive)
WORKDIR /app/backend
RUN npm install --production --no-optional

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install --production --no-optional
COPY frontend/ ./
RUN npm run build

# Copy backend source code
WORKDIR /app
COPY backend/ ./backend/

# Copy built frontend to backend for serving
RUN cp -r frontend/build backend/frontend/

# Create necessary directories
RUN mkdir -p backend/uploads
RUN mkdir -p backend/frontend/public/webgl-tasks

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
