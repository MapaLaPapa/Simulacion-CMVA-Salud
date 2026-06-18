# Simulación CMVA Salud

Descripción
------------

Proyecto para la simulación y gestión de componentes de una solución de salud (CMVA). Incluye servicios de frontend, backend, chat con IA, telefonía (Asterisk), infraestructura de base de datos con réplica, gateway (Nginx) y monitorización (Prometheus). Los contenedores y orquestación se preparan con `docker-compose`.

Requisitos
----------

- Docker y Docker Compose instalados.

Estructura del repositorio (resumen)
------------------------------------

- `docker-compose.yml` - Orquestación general del proyecto (nivel raíz).
- `infraestructure/` - Archivos de infraestructura:
  - `database/` - Compose y scripts de inicialización SQL (`init/1_profesionales.sql`, `init/2_pacientes.sql`) y configuraciones para primaria/replica.
  - `gateway/` - `Dockerfile` y `nginx.conf` para el gateway reverso.
  - `monitoring/prometheus/` - Configuración de Prometheus (`prometheus.yml`).
- `services/asterisk/` - Imagen y configuración de Asterisk (telefonía): `Dockerfile`, `extensions.conf`, `pjsip.conf`, `rtp.conf`, sonidos.
- `backend/` - Servicio backend (Node.js): `Dockerfile`, `package.json`, `server.js`, `notificaciones.js`.
- `chatIA/` - Servicio de chat con IA (Node.js): `Dockerfile`, `package.json`, `server.js`, `systemPrompt.js`.
- `frontend/` - Aplicación frontend (Vite + React + TypeScript): `package.json`, `vite.config.ts`, `src/` con componentes y páginas.
- `scripts/` - Scripts de utilidades: backups (`backup/backup.sh`), despliegue (`deploy/`), restauración (`restore/`).

Arranque con Docker (recomendado)
---------------------------------

1. Desde la raíz del proyecto, levantar los servicios definidos en el `docker-compose.yml` principal:

```powershell
docker-compose up -d --build
```

2. Si la base de datos está separada y se quiere iniciar la pila de base de datos directamente:

```powershell
docker-compose -f infraestructure/database/docker-compose.yml up -d --build
```

Base de datos y datos iniciales
-------------------------------

En `infraestructure/database/init/` están los scripts SQL de inicialización: `1_profesionales.sql` y `2_pacientes.sql`. Al usar la composición de Docker para la base de datos, esos scripts se suelen ejecutar automáticamente al arrancar el contenedor si están montados en la ruta de inicialización del motor.

Monitorización
---------------

Configuración de Prometheus en `infraestructure/monitoring/prometheus/prometheus.yml`.

Scripts útiles
---------------

- `scripts/backup/backup.sh` - Copias de seguridad automatizadas.
- `scripts/deploy/` - Scripts de despliegue y configuración de réplica.

Notas finales
-------------

Este README resume la arquitectura y los pasos básicos para levantar y desarrollar el proyecto. Para cambios específicos (puertos, variables de entorno, credenciales), revisar los `Dockerfile`, `docker-compose.yml` y los archivos `package.json` en cada servicio.
