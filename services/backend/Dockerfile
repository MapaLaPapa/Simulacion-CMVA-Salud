FROM node:20.12-alpine

LABEL maintainer="María Paz"
LABEL description="Backend API REST - Sistema de Agendamiento Médico \
Gestiona las consultas de la web a las bases de datos.\
Las consultas van al gestor de la base de datos por lo que \
las solicitudes no contienen consultas SQL directamente."

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

USER node

ENV PORT=5000
EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server.js"]