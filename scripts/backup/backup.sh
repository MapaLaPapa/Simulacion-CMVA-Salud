#!/bin/bash

# Detiene el script inmediatamente si ocurre algún error
set -e

DB_USER="root"
# COMILLAS SIMPLES obligatorias por el carácter especial !
DB_PASS='MasterRootPassword2026!' 
CONTAINER_NAME="rayen_mysql_primary"
BACKUP_DIR="/var/backups/rayen" 
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
RETENTION_DAYS=7

echo "Iniciando proceso de respaldo..."

# Se requiere sudo para escribir en /var/backups
sudo mkdir -p "$BACKUP_DIR"

# Respaldo 1: Profesionales (agregamos sudo a docker)
echo "Respaldando base de datos: rayen_profesionales..."
sudo docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" rayen_profesionales > "$BACKUP_DIR/rayen_profesionales_$DATE.sql"

# Respaldo 2: Pacientes
echo "Respaldando base de datos: rayen_pacientes..."
sudo docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" rayen_pacientes > "$BACKUP_DIR/rayen_pacientes_$DATE.sql"

echo "¡Respaldos generados con éxito en $BACKUP_DIR!"

# Limpieza: Borrar archivos más antiguos de 7 días
echo "Ejecutando limpieza de respaldos antiguos..."
sudo find "$BACKUP_DIR" -type f -name "*.sql" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Proceso finalizado correctamente."
