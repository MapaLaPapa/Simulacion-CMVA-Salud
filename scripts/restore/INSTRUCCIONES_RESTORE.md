# Procedimiento de Restauración (Disaster Recovery)

En caso de pérdida de datos o corrupción en el contenedor `rayen_mysql_primary`, siga estos pasos para restaurar desde el último respaldo automatizado:

1. **Ubicar el último respaldo:**
   Navegue al directorio de respaldos en el servidor anfitrión:
   `cd /var/backups/rayen`
   Identifique los archivos `.sql` más recientes (ej. `rayen_pacientes_2026-06-15_03-00-00.sql`).

2. **Copiar el archivo al contenedor (Opcional si no hay volumen montado directo):**
   `docker cp rayen_pacientes_2026-06-15_03-00-00.sql rayen_mysql_primary:/tmp/restore.sql`

3. **Ejecutar la restauración:**
   Inyecte el volcado directamente en la base de datos a través del contenedor:
   `docker exec -i rayen_mysql_primary mysql -u root -pTuClaveSecreta rayen_pacientes < /var/backups/rayen/rayen_pacientes_2026-06-15_03-00-00.sql`

4. **Verificación:**
   Una vez finalizado, revise los logs de la aplicación y valide a través de la web que los datos de las agendas estén íntegros. Al restaurar en el nodo primario, la replicación sincronizará automáticamente los datos restaurados hacia el nodo réplica.