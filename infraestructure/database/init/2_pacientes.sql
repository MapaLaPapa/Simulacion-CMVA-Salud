CREATE DATABASE IF NOT EXISTS rayen_pacientes;
USE rayen_pacientes;
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: rayen_pacientes
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Citas_Agendadas`
--

DROP TABLE IF EXISTS `Citas_Agendadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Citas_Agendadas` (
  `id_cita` int NOT NULL AUTO_INCREMENT,
  `rut_paciente` varchar(12) NOT NULL,
  `id_bloque_externo` int NOT NULL,
  `estado_cita` enum('RESERVADA','CONFIRMADA','CANCELADA','ASISTIDA','INASISTIDA') NOT NULL DEFAULT 'RESERVADA',
  `origen_reserva` enum('WEB','IVR','PRESENCIAL') NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cita`),
  KEY `fk_paciente` (`rut_paciente`),
  CONSTRAINT `fk_paciente` FOREIGN KEY (`rut_paciente`) REFERENCES `Pacientes` (`rut`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Citas_Agendadas`
--

LOCK TABLES `Citas_Agendadas` WRITE;
/*!40000 ALTER TABLE `Citas_Agendadas` DISABLE KEYS */;
INSERT INTO `Citas_Agendadas` VALUES (2,'201234567',1,'INASISTIDA','WEB','2026-05-06 03:34:00'),(3,'201234567',2,'CONFIRMADA','WEB','2026-05-09 01:42:36'),(7,'12345678',7,'ASISTIDA','WEB','2026-05-09 03:30:17'),(8,'111111111',11,'RESERVADA','WEB','2026-05-09 03:32:59'),(9,'201234567',9,'CANCELADA','WEB','2026-05-09 04:43:01'),(10,'209390833',8,'CANCELADA','WEB','2026-05-10 20:08:08'),(11,'209390833',8,'CANCELADA','WEB','2026-05-11 20:06:27'),(12,'209505886',4,'ASISTIDA','WEB','2026-05-12 03:31:53'),(13,'209390833',3,'CANCELADA','IVR','2026-05-12 18:47:34'),(14,'209390833',3,'INASISTIDA','IVR','2026-05-12 18:55:29'),(15,'209390833',8,'CANCELADA','IVR','2026-05-12 19:08:13'),(16,'209390833',9,'RESERVADA','IVR','2026-05-12 19:13:09'),(17,'112223334',101,'RESERVADA','PRESENCIAL','2026-05-12 12:15:00'),(18,'15.987.654-3',102,'CONFIRMADA','IVR','2026-05-12 13:30:00'),(19,'17.321.654-7',103,'RESERVADA','WEB','2026-05-12 14:45:00'),(20,'18.456.789-0',104,'ASISTIDA','PRESENCIAL','2026-05-11 15:00:00'),(21,'20.123.456-K',105,'CANCELADA','WEB','2026-05-12 16:20:00'),(22,'209505886',106,'RESERVADA','WEB','2026-05-12 18:10:00'),(23,'21.555.444-2',107,'CONFIRMADA','PRESENCIAL','2026-05-12 19:00:00'),(24,'9.876.543-2',108,'INASISTIDA','IVR','2026-05-10 20:30:00'),(25,'209390833',109,'RESERVADA','IVR','2026-05-12 21:05:00'),(26,'12.345.678-9',110,'CONFIRMADA','WEB','2026-05-12 21:15:00'),(27,'209390833',8,'RESERVADA','IVR','2026-05-12 21:27:47'),(28,'209390833',10,'RESERVADA','IVR','2026-05-12 22:34:56'),(29,'345453453',18,'CONFIRMADA','WEB','2026-05-12 22:44:21');
/*!40000 ALTER TABLE `Citas_Agendadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Historial_Notificaciones`
--

DROP TABLE IF EXISTS `Historial_Notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Historial_Notificaciones` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_cita` int NOT NULL,
  `canal` enum('SMS','WSP','CORREO') NOT NULL,
  `estado` enum('PENDIENTE','ENVIADO','FALLIDO') NOT NULL DEFAULT 'PENDIENTE',
  `id_mensaje_proveedor` varchar(255) DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `detalles_error` text,
  PRIMARY KEY (`id_notificacion`),
  KEY `id_cita` (`id_cita`),
  CONSTRAINT `Historial_Notificaciones_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `Citas_Agendadas` (`id_cita`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Historial_Notificaciones`
--

LOCK TABLES `Historial_Notificaciones` WRITE;
/*!40000 ALTER TABLE `Historial_Notificaciones` DISABLE KEYS */;
INSERT INTO `Historial_Notificaciones` VALUES (1,12,'SMS','FALLIDO',NULL,'2026-05-11 23:40:38','Invalid \'To\' Phone Number: +987987XXXX'),(2,12,'WSP','ENVIADO','MMd6baabf5a4b921b0d0fb3776c2de4051','2026-05-11 23:40:39',NULL),(3,12,'CORREO','ENVIADO','<506f3cec-04b6-42ff-e19e-cfacc5983f86@gmail.com>','2026-05-11 23:40:41',NULL);
/*!40000 ALTER TABLE `Historial_Notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Pacientes`
--

DROP TABLE IF EXISTS `Pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pacientes` (
  `rut` varchar(12) NOT NULL,
  `nombre_legal` varchar(100) NOT NULL,
  `apellido_pat` varchar(100) NOT NULL,
  `apellido_mat` varchar(100) NOT NULL,
  `nombre_social` varchar(100) DEFAULT NULL,
  `fecha_nac` date NOT NULL,
  `sexo_registral` enum('Femenino','Masculino','Otro') NOT NULL,
  `sexo_nacimiento` enum('Femenino','Masculino','Intersexual') NOT NULL,
  `identidad_genero` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` text NOT NULL,
  PRIMARY KEY (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Pacientes`
--

LOCK TABLES `Pacientes` WRITE;
/*!40000 ALTER TABLE `Pacientes` DISABLE KEYS */;
INSERT INTO `Pacientes` VALUES ('111111111','a','a','a','a','1911-11-11','Otro','Intersexual',NULL,'+5622222222',NULL,'aaaaa 111'),('112223334','Juan','Pérez','García',NULL,'1975-11-20','Masculino','Masculino','Cisgénero','+56987654321','juan.perez@email.cl','Av. España 1200, Curicó'),('12.345.678-9','Carlos Alberto','Rojas','Muñoz',NULL,'1975-05-12','Masculino','Masculino','Cisgénero','+56912345678','c.rojas75@gmail.com','Calle Villota 450, Curicó'),('12345678','Persona','Falsa','Prueba','Don','2010-11-12','Otro','Intersexual',NULL,'+56911223344',NULL,'Calle Falsa 123'),('15.987.654-3','Elena del Carmen','Méndez','Pizarro',NULL,'1962-11-05','Femenino','Femenino','Cisgénero','+56944332211','elena.mendez.p@gmail.com','Camino a Zapallar Km 2.5, Curicó'),('17.321.654-7','Camila Belén','Valenzuela','Araya',NULL,'1989-12-02','Femenino','Femenino','Cisgénero','+56999887766','cami.vale.araya@gmail.com','Rauquén, Pasaje Los Alerces 56, Curicó'),('18.456.789-0','Valentina Ignacia','Silva','Castro','Vale','1993-08-24','Femenino','Femenino','Cisgénero','+56987654321','v.silva.castro@outlook.com','Población Sol de Septiembre, Pasaje 4, Curicó'),('20.123.456-K','Matías Andrés','Tapia','Guerrero',NULL,'1999-01-30','Masculino','Masculino','Cisgénero','+56955443322','m.tapia99@ucm.cl','Avenida España 120, Curicó'),('201234567','Roberto','Muñoz','Duarte','Maite','1998-03-15','Otro','Masculino','Trans Femenina','+56912345678','maite.m@email.cl','Calle Villota 450, Curicó'),('209390833','Maria Paz','Espinoza','Gómez',NULL,'2001-12-18','Femenino','Femenino',NULL,'+56956154606','mariapazespinozagomez@gmail.com','Curico'),('209505886','Juan','Machuca','Araya','JC','2001-12-22','Masculino','Masculino',NULL,'+9879876567','jmachuca20@alumnos.utalca.cl','Rengo'),('21.555.444-2','Francisca Paz','Alarcón','Soto','Fran','2004-03-15','Otro','Femenino','No binario','+56966778899','fran.alarcon@gmail.com','Sarmiento, Calle Arturo Prat 89, Curicó'),('345453453','prueba','sagsg','gshgs',NULL,'2027-02-12','Masculino','Masculino',NULL,'+34567567986',NULL,'gasgs'),('9.876.543-2','Ricardo Antonio','Fuenzalida','Leiva',NULL,'1955-07-20','Masculino','Masculino','Cisgénero','+56922113344','r.fuenzalida@vtr.net','Condominio El Boldo, Casa 12, Curicó');
/*!40000 ALTER TABLE `Pacientes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 22:03:13
