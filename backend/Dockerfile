FROM node:20-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/package-lock.json .
COPY backend/ .

RUN npm install

EXPOSE 4000

RUN npm run db:generate
RUN npm run build
CMD ["npm", "run", "start"]
