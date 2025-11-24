FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# No external dependencies, but keeping step for future additions
RUN npm install --omit=dev || true
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
