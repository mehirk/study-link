FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY zero-syncer/package.json ./zero-syncer/
RUN npm install -g pnpm && pnpm install --filter zero-syncer

COPY zero-syncer/ ./zero-syncer/

EXPOSE 4848
CMD ["pnpm", "zero-cache"]
