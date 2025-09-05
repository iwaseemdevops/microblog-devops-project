
# Use Node 18 slim
FROM node:18-slim

# Install system dependencies (including OpenSSL)
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    git \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript project (Nx)
RUN npm run build -- --skip-nx-cache

# Check the build output structure
RUN ls -la dist/ && ls -la dist/api/

# Expose backend port
EXPOSE 3000

# Command: run migrations, seed, and start server
CMD sh -c "npx prisma migrate deploy && node src/prisma/seed.js && node dist/api/main.js"