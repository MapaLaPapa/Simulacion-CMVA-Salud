#!/bin/bash

echo "Iniciando configuración de replicación..."

echo "Configurando nodo primario..."
mysql -h rayen_mysql_primary -u root -p"${MYSQL_ROOT_PASSWORD}" -e "
CREATE USER IF NOT EXISTS 'replica_user'@'%' IDENTIFIED BY 'RayenReplica2026!';
GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'%';
FLUSH PRIVILEGES;
"

echo "Obteniendo coordenadas del nodo primario..."
MASTER_STATUS=$(mysql -h rayen_mysql_primary -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW MASTER STATUS\G")

FILE=$(echo "$MASTER_STATUS" | grep "File:" | awk '{print $2}')
POSITION=$(echo "$MASTER_STATUS" | grep "Position:" | awk '{print $2}')

echo "Coordenadas obtenidas -> Archivo: $FILE | Posición: $POSITION"

echo "Iniciando sincronización en el nodo réplica..."
mysql -h rayen_mysql_replica -u root -p"${MYSQL_ROOT_PASSWORD}" -e "
STOP REPLICA;
CHANGE REPLICATION SOURCE TO 
  SOURCE_HOST='rayen_mysql_primary',
  SOURCE_USER='replica_user',
  SOURCE_PASSWORD='RayenReplica2026!',
  SOURCE_LOG_FILE='$FILE',
  SOURCE_LOG_POS=$POSITION;
START REPLICA;
"

echo "=== ESTADO DE LA REPLICACIÓN ==="
mysql -h rayen_mysql_replica -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW REPLICA STATUS\G" | grep "Running:"
