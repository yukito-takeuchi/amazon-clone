FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY backend/ .

# Build TypeScript
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Heroku uses $PORT environment variable
# Don't use EXPOSE with hardcoded port

# Start the production server
CMD ["npm", "start"]
