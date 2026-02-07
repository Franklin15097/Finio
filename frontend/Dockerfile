FROM nginx:alpine

# Установка curl для healthcheck
RUN apk add --no-cache curl

# Создание директории для статических файлов
RUN mkdir -p /usr/share/nginx/html

# Копирование статических файлов
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открытие порта
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]