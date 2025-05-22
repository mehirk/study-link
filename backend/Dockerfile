FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
RUN npm install -g pnpm && pnpm install --filter backend

COPY backend/ ./backend/

RUN cd backend && \
    pnpm db:generate && \
    pnpm build

FROM node:20-alpine AS final

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/index.js"]
