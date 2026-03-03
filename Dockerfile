# Base image
FROM node:20-slim

# Install necessary build tools, SQLite dependencies, and Puppeteer prerequisites
RUN apt-get update && apt-get install -y \
    python3 \
    python3-dev \
    make \
    g++ \
    sqlite3 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for tsx)
RUN npm install

# Copy source code and configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Create necessary directories
RUN mkdir -p /app/data /app/skills/quarantine /app/sandbox

# Set environment variable defaults (can be overridden by docker-compose)
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
ENV SKILLS_DIR=/app/skills
ENV SANDBOX_DIR=/app/sandbox

# Run the agent using tsx
CMD ["npm", "run", "start"]
