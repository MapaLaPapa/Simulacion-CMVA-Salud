FROM node:20.12-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run dev

FROM nginxinc/nginx-unprivileged:1.25-alpine

LABEL maintainer="Juan"
LABEL description="Frontend React - Interfaz web para pacientes y administradores"

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]