# Simple Node.js deployment for Railway
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

# Copy package files and build script
COPY package*.json ./
COPY build.js ./

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Install dependencies and build
RUN npm install
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ping || exit 1

# Start the application
CMD ["npm", "start"]
