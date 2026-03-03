# Build from Alpine for minimum attack surface
FROM node:20-alpine

# Install Chromium and dependencies required for Puppeteer on Alpine
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Tell Puppeteer to skip downloading its own Chrome and use the system one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the API port
EXPOSE 8080

# Run as non-root user (important for container security)
# Create a dedicated user for puppeteer
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app

USER pptruser

CMD [ "npm", "start" ]
