#!/bin/bash

DB_USER="root"
DB_PASS="ingresar_clave_root" 
CONTAINER_NAME="rayen_mysql_primary"
BACKUP_DIR="/var/backups/rayen" 
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" rayen_profesionales > "$BACKUP_DIR/rayen_profesionales_$DATE.sql"

docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" rayen_pacientes > "$BACKUP_DIR/rayen_pacientes_$DATE.sql"

if [ $? -eq 0 ]; then
  echo "Respaldos completados con exito."
else
  echo "Error al generar los respaldos."
  exit 1
fi

find "$BACKUP_DIR" -type f -name "*.sql" -mtime +$RETENTION_DAYS -exec rm {} \;
