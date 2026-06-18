CREATE DATABASE IF NOT EXISTS rayen_profesionales;
USE rayen_profesionales;

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

DROP TABLE IF EXISTS `Agenda_Bloques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Agenda_Bloques` (
  `id_bloque` int NOT NULL AUTO_INCREMENT,
  `id_rol` int NOT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `box` varchar(50) DEFAULT NULL,
  `estado` enum('DISPONIBLE','RESERVADO','FINALIZADO') NOT NULL DEFAULT 'DISPONIBLE',
  PRIMARY KEY (`id_bloque`),
  KEY `fk_rol` (`id_rol`),
  CONSTRAINT `fk_rol` FOREIGN KEY (`id_rol`) REFERENCES `Roles` (`id_rol`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Agenda_Bloques` WRITE;
/*!40000 ALTER TABLE `Agenda_Bloques` DISABLE KEYS */;
INSERT INTO `Agenda_Bloques` VALUES (1,1,'2026-05-16 13:20:00','2026-05-16 13:40:00','BOX A-12','FINALIZADO'),(2,1,'2026-05-15 13:20:00','2026-05-15 13:40:00','BOX A-12','RESERVADO'),(3,2,'2026-05-06 10:00:00','2026-05-06 10:15:00','BOX B-05','FINALIZADO'),(4,1,'2026-05-18 09:00:00','2026-05-18 09:20:00','BOX A-12','FINALIZADO'),(5,1,'2026-05-18 09:20:00','2026-05-18 09:40:00','BOX A-12','DISPONIBLE'),(6,1,'2026-05-18 09:40:00','2026-05-18 10:00:00','BOX A-12','DISPONIBLE'),(7,1,'2026-05-18 10:00:00','2026-05-18 10:20:00','BOX A-12','FINALIZADO'),(8,2,'2026-05-19 14:00:00','2026-05-19 14:15:00','BOX B-05','RESERVADO'),(9,2,'2026-05-19 14:15:00','2026-05-19 14:30:00','BOX B-05','RESERVADO'),(10,2,'2026-05-19 14:30:00','2026-05-19 14:45:00','BOX B-05','RESERVADO'),(11,2,'2026-05-19 14:45:00','2026-05-19 15:00:00','BOX B-05','RESERVADO'),(12,3,'2026-05-14 09:00:00','2026-05-14 09:30:00','BOX D-01','DISPONIBLE'),(13,3,'2026-05-14 09:30:00','2026-05-14 10:00:00','BOX D-01','RESERVADO'),(14,3,'2026-05-14 10:00:00','2026-05-14 10:30:00','BOX D-01','DISPONIBLE'),(15,4,'2026-05-15 10:00:00','2026-05-15 10:45:00','BOX C-03','RESERVADO'),(16,4,'2026-05-15 10:45:00','2026-05-15 11:30:00','BOX C-03','DISPONIBLE'),(17,5,'2026-05-13 08:20:00','2026-05-13 08:40:00','BOX M-02','RESERVADO'),(18,5,'2026-05-13 08:40:00','2026-05-13 09:00:00','BOX M-02','RESERVADO'),(19,5,'2026-05-13 09:00:00','2026-05-13 09:20:00','BOX M-02','DISPONIBLE'),(20,6,'2026-05-14 14:00:00','2026-05-14 14:30:00','GIMNASIO 1','RESERVADO'),(21,6,'2026-05-14 14:30:00','2026-05-14 15:00:00','GIMNASIO 1','DISPONIBLE'),(22,7,'2026-05-15 11:00:00','2026-05-15 11:20:00','BOX N-01','DISPONIBLE'),(23,7,'2026-05-15 11:20:00','2026-05-15 11:40:00','BOX N-01','DISPONIBLE');
/*!40000 ALTER TABLE `Agenda_Bloques` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `Especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Especialidades` (
  `codigo_esp` varchar(20) NOT NULL,
  `especialidad` varchar(150) NOT NULL,
  PRIMARY KEY (`codigo_esp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Especialidades` WRITE;
/*!40000 ALTER TABLE `Especialidades` DISABLE KEYS */;
INSERT INTO `Especialidades` VALUES ('GIN-02','Ginecología y Obstetricia'),('KIN-01','Kinesiología'),('MAT-01','Matronería'),('MED-GRAL','Medicina General'),('NUT-01','Nutrición'),('ODO-01','Odontología'),('PED-01','Pediatría'),('PSI-01','Psicología');
/*!40000 ALTER TABLE `Especialidades` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `Profesionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Profesionales` (
  `rut` varchar(12) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido_pat` varchar(100) NOT NULL,
  `apellido_mat` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Profesionales` WRITE;
/*!40000 ALTER TABLE `Profesionales` DISABLE KEYS */;
INSERT INTO `Profesionales` VALUES ('109876543','Marcela','Pino','Lagos',1),('123456789','Andrea','Valenzuela','Rojas',1),('132109876','Lorena','Oyarzún','Gálvez',1),('156789012','Patricio','Fuentes','Mora',1),('165432109','Jorge','Salinas','Pérez',1),('178901234','Diego','Cáceres','Reyes',1),('987654321','Camila','Vidal','Soto',1);
/*!40000 ALTER TABLE `Profesionales` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `rut` varchar(12) NOT NULL,
  `codigo_esp` varchar(20) NOT NULL,
  `cesfam` varchar(100) NOT NULL,
  `bloque_tiempo` int NOT NULL,
  PRIMARY KEY (`id_rol`),
  KEY `fk_profesional` (`rut`),
  KEY `fk_especialidad` (`codigo_esp`),
  CONSTRAINT `fk_especialidad` FOREIGN KEY (`codigo_esp`) REFERENCES `Especialidades` (`codigo_esp`) ON DELETE RESTRICT,
  CONSTRAINT `fk_profesional` FOREIGN KEY (`rut`) REFERENCES `Profesionales` (`rut`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (1,'123456789','PED-01','CESFAM Curicó Centro',20),(2,'156789012','MED-GRAL','CESFAM Sol de Septiembre',15),(3,'109876543','ODO-01','CESFAM Colón',30),(4,'165432109','PSI-01','CESFAM Betty Muñoz Arce',45),(5,'132109876','MAT-01','CESFAM Sol de Septiembre',20),(6,'178901234','KIN-01','CESFAM Curicó Centro',30),(7,'987654321','NUT-01','CECOSF Prosperidad',20);
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

