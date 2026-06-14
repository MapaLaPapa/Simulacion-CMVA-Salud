FROM nginxinc/nginx-unprivileged:1.25-alpine

LABEL maintainer="Maria Paz"
LABEL description="API Gateway"

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]