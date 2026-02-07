FROM node:18-alpine

# Установка зависимостей
RUN apk add --no-cache mysql-client

# Создание рабочей директории
WORKDIR /app

# Копирование package.json
COPY package.json .

# Установка зависимостей
RUN npm install --production

# Копирование кода
COPY . .

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Открытие порта
EXPOSE 8000

# Команда запуска
CMD ["npm", "start"]