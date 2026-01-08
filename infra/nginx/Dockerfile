# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ ./
RUN npm run build

# Nginx with SSL
FROM nginx:alpine

RUN apk add --no-cache openssl

COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/CN=localhost"

# Copy built frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

RUN rm -f /var/log/nginx/access.log /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown nginx:nginx /var/log/nginx/*.log

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
