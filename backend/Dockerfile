FROM node:20-alpine

# Install required system packages
RUN apk add --no-cache openssl curl

WORKDIR /api

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build NestJS application
RUN npm run build

# Set proper permissions for node user
RUN chown -R node:node /api

USER node

EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]