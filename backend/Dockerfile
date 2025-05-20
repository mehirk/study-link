FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend

COPY backend/ ./backend/

RUN cd backend && \
    npm run db:generate && \
    npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/index.js"]
