FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY scripts ./scripts
COPY jarvis-v1 ./jarvis-v1

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
