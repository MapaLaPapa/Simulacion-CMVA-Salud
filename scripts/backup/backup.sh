#!/bin/bash

set -e

DB_USER="root"
DB_PASS='MasterRootPassword2026!' 
CONTAINER_NAME="rayen_mysql_primary"
BACKUP_DIR="/var/backups/rayen"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
RETENTION_DAYS=7

echo "Iniciando proceso de respaldo..."

sudo mkdir -p "$BACKUP_DIR"

echo "Respaldando base de datos: rayen_profesionales..."
sudo docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" rayen_profesionales > "$BACKUP_DIR/rayen_profesionales_$DATE.sql"

echo "Respaldando base de datos: rayen_pacientes..."
sudo docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" rayen_pacientes > "$BACKUP_DIR/rayen_pacientes_$DATE.sql"

echo "¡Respaldos generados con éxito en $BACKUP_DIR!"

echo "Ejecutando limpieza de respaldos antiguos..."
sudo find "$BACKUP_DIR" -type f -name "*.sql" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Proceso finalizado correctamente."
