#!/bin/bash

source ../../.env

docker exec rayen_mysql_primary env MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql -u root -e "
CREATE USER IF NOT EXISTS 'replica_user'@'%' IDENTIFIED BY 'RayenReplica2026!';
GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'%';
FLUSH PRIVILEGES;
"

MASTER_STATUS=$(docker exec rayen_mysql_primary env MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql -u root -e "SHOW MASTER STATUS\G")

FILE=$(grep File | awk '{print $2}')
POSITION=$(grep Position | awk '{print $2}')

docker exec rayen_mysql_replica env MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql -u root -e "
STOP REPLICA;
CHANGE REPLICATION SOURCE TO 
  SOURCE_HOST='rayen_mysql_primary',
  SOURCE_USER='replica_user',
  SOURCE_PASSWORD='RayenReplica2026!',
  SOURCE_LOG_FILE='$FILE',
  SOURCE_LOG_POS=$POSITION;
START REPLICA;
"

docker exec rayen_mysql_replica env MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql -u root -e "SHOW REPLICA STATUS\G" | grep "Running:"
