## Análisis de Presupuesto y Optimización de Recursos

Para el despliegue de esta nueva arquitectura unificada, se utilizó una única máquina virtual en Google Cloud configurada con **4 CPUs virtuales, 16 GB de memoria RAM y un disco de 50 GB.**

Bajo el modelo de pago por uso y manteniendo el servidor operativo con alta disponibilidad 24/7, el costo mensual estimado es de USD 107.73, lo que equivale a alrededor de USD 0.15 por hora.

A continuación, se detalla el presupuesto e infraestructura base obtenido desde la calculadora de Compute Engine para la región de despliegue:

| Elemento                   | Especificación Técnica              | Estimación Mensual  |
| :------------------------- | :------------------------------------ | :------------------- |
| **Cómputo**         | 4 CPU virtuales + 16 GB de memoria    | USD 102.73           |
| **Almacenamiento**   | Disco de 50 GB                        | USD 5.00             |
| **Total Proyectado** | **Régimen de operación 24/7** | **USD 107.73** |

* **Cómputo:** Este monto cubre el procesamiento de Nginx, el servidor Asterisk, el backend de Node.js y los nodos del clúster de datos conviviendo de forma paralela.
* **Almacenamiento:** Destinados estrictamente a sostener el sistema operativo anfitrión, el almacenamiento de las imágenes base de Docker y ambas bases de datos.

### Comparativa con la Arquitectura de la Unidad 1

En la primera unidad del proyecto, el sistema clínico operaba de forma fragmentada a lo largo de 4 máquinas virtuales independientes (instancias tipo e2-micro o e2-medium). Aunque la suma del costo de esas instancias individuales podía rondar un valor entre USD 110 y USD 130 mensuales, desde la perspectiva de la eficiencia de infraestructura presentaba un problema grave de recursos conocido como el "impuesto de redundancia".

En la Unidad 1 estábamos pagando por cuatro discos de arranque de forma separada y reservando memoria y CPU de manera rígida para mantener vivos cuatro sistemas operativos Ubuntu independientes. En las horas de bajo tráfico, los recursos sobrantes de alguna maquina podían quedar completamente ociosos y aislados, sin posibilidad de ser aprovechados por los otros servicios que estuvieran sufriendo una mayor carga de trabajo en ese mismo instante.

La migración hacia una arquitectura basada en contenedores de Docker dentro de una sola máquina virtual de mayor envergadura representó una optimización presupuestaria y técnica radical. Al centralizar la operación, eliminamos la sobrecarga económica y de rendimiento que significaba mantener múltiples sistemas operativos corriendo en paralelo.

Con este nuevo enfoque, los USD 107.73 mensuales se traducen en una bolsa de recursos dinámica y eficiente: el 100% de la CPU y la RAM por la que pagamos se distribuye en tiempo real según las necesidades del sistema. Si el backend o el clúster de MySQL sufren una mayor carga durante el agendamiento masivo de citas, tienen a su disposición inmediata los 16 GB de RAM y los 4 cores de la máquina virtual.
