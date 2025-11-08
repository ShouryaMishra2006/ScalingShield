FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js dashboard.html ./
EXPOSE 4200
CMD ["node", "server.js"]
