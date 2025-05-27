FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY zero-syncer/package.json ./zero-syncer/
RUN npm install -g pnpm && pnpm install --filter zero-syncer

COPY zero-syncer/ ./zero-syncer/

FROM node:20-alpine AS final

WORKDIR /app

COPY --from=builder /app/zero-syncer ./zero-syncer/
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/zero-syncer/node_modules ./node_modules/

WORKDIR /app/zero-syncer
EXPOSE 4848
CMD ["npx", "zero-cache"]
