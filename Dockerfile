# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Build website
COPY website-frontend/package*.json ./website-frontend/
RUN cd website-frontend && npm ci
COPY website-frontend ./website-frontend
RUN cd website-frontend && npm run build

# Build mini-app
COPY mini-app-frontend/package*.json ./mini-app-frontend/
RUN cd mini-app-frontend && npm ci
COPY mini-app-frontend ./mini-app-frontend
RUN cd mini-app-frontend && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server ./

# Copy built frontend
COPY --from=frontend-builder /app/website-frontend/dist ./website-frontend/dist
COPY --from=frontend-builder /app/mini-app-frontend/dist ./mini-app-frontend/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "index-simple.js"]
