# Сервис чата: Node запускает TypeScript сам, зависимостей нет, сборка не нужна.
# Контекст сборки -- корень репо: промпт берёт данные о Татьяне из src/data.

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY src/data ./src/data
COPY chat/src ./chat/src
USER node
EXPOSE 8787
CMD ["node", "chat/src/server.ts"]
