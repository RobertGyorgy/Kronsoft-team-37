FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY pwa-bridge.js ./

EXPOSE 8081

CMD ["node", "pwa-bridge.js"]
