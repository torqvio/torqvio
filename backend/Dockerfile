FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies to keep production image small
RUN npm prune --production

# Expose port
EXPOSE 8459

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8459/health || exit 1

# Start the application
CMD ["npm", "start"]
