-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: admin_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `record_name` varchar(255) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `admin_username` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,'Ikki Dominique Modar','added','Admin_H1','2026-01-17 17:43:14'),(2,'Ikki Dominique Modar','removed','Admin_H1','2026-01-17 17:44:06'),(3,'Ikki Dominique Modar','removed','Admin_H1','2026-01-17 17:47:54'),(4,'Johanna Lucia Hizon','added','Admin_H1','2026-01-17 17:47:59'),(5,'Jian Vench Palculan','added','Admin_H1','2026-01-17 17:48:05'),(6,'Nheil Patrick Patawaran','added','Admin_H1','2026-01-17 17:48:13'),(7,'Nheil Patrick Patawaran','modified','Admin_H1','2026-01-18 16:21:41'),(8,'Ikki Dominique Modar','added','Admin_H1','2026-01-18 20:15:13'),(9,'Ikki Dominique Modar','modified','Admin_H1','2026-01-18 20:17:56'),(10,'Jian Vench Palculan','modified','Admin_H1','2026-01-18 20:19:33'),(11,'Johanna Lucia Hizon','modified','Admin_H2','2026-01-18 20:34:28'),(12,'Cantarella Fisalia','added','Admin_H2','2026-01-18 20:53:11'),(13,'Cantarella Fisalia','modified','Admin_H2','2026-01-18 20:54:32'),(14,'Raiden Mei','added','Admin_H2','2026-01-18 20:58:19'),(15,'Raiden Mei','modified','Admin_H2','2026-01-18 20:59:25'),(16,'Misha Legwork','added','Admin_H2','2026-01-18 21:00:00'),(17,'Misha Legwork','modified','Admin_H2','2026-01-18 21:00:54'),(18,'Jose Emmanuel Hizon','added','Admin_H1','2026-01-20 22:18:57'),(19,'Alejandro Reyes','added','Admin_H1','2026-01-23 00:12:09'),(20,'Alejandro Reyes','modified','Admin_H1','2026-01-23 00:13:21'),(21,'Prince Nheil','added','Admin_H1','2026-01-24 16:35:26'),(22,'Alvin Perez','added','Admin_H1','2026-01-24 16:36:10'),(23,'Alvin Perez','modified','Admin_H1','2026-01-24 16:36:57'),(24,'Prince Nheil','modified','Admin_H1','2026-01-24 16:37:57'),(25,'Stephen Gonzales','removed','Admin_H1','2026-01-24 16:39:31'),(26,'Marieq Posa','added','Admin_H1','2026-01-24 16:39:45'),(27,'Marieq Posa','modified','Admin_H1','2026-01-24 16:40:11'),(28,'Raiden Mei','removed','Admin_H1','2026-01-24 16:40:36'),(29,'Carlotta Montiny','removed','Admin_H1','2026-01-24 16:40:52'),(30,'Alvin Perezes','modified','HealthWorker_01','2026-01-24 16:47:55'),(31,'Justin Timberlake','added','HealthWorker_01','2026-01-24 16:56:16'),(32,'Justin Timberlake','modified','HealthWorker_01','2026-01-24 16:56:59'),(33,'Justin Timberlake','modified','HealthWorker_01','2026-01-24 16:59:12'),(34,'Justin Timberlake','modified','HealthWorker_01','2026-01-24 17:05:49'),(35,'Prince Nheil','modified','HealthWorker_01','2026-01-24 17:08:44'),(36,'Justin Timberlake','modified','HealthWorker_01','2026-01-24 17:09:17'),(37,'Justin Timberlake','modified','HealthWorker_01','2026-01-24 17:13:19'),(38,'Justin Timberlake','modified','HealthWorker_01','2026-01-24 17:15:09'),(39,'Seijuro Akashi','added','HealthWorker_01','2026-01-24 17:15:19'),(40,'Seijuro Akashi','modified','HealthWorker_01','2026-01-24 17:15:37'),(41,'jose chan','added','HealthWorker_01','2026-01-24 17:23:06'),(42,'jose chan','modified','HealthWorker_01','2026-01-24 17:24:57'),(43,'Seijuro Akashi','modified','HealthWorker_01','2026-01-24 17:25:20'),(44,'Alvin Perezes','modified','HealthWorker_01','2026-01-24 17:25:34'),(45,'John Clarianes','added','HealthWorker_01','2026-01-24 17:29:14'),(46,'John Clarianes','modified','HealthWorker_01','2026-01-24 17:29:29'),(47,'marie cy','added','HealthWorker_01','2026-01-24 17:47:43'),(48,'marie cy','modified','HealthWorker_01','2026-01-24 17:48:32'),(49,'mam cy sss','added','HealthWorker_01','2026-01-24 17:49:12'),(50,'mama mia','added','HealthWorker_01','2026-01-24 17:54:09'),(51,'joseph chan','added','HealthWorker_01','2026-01-24 18:16:32'),(52,'joseph chan','modified','HealthWorker_01','2026-01-24 18:16:50'),(53,'joseph chan','modified','HealthWorker_01','2026-01-24 18:37:43'),(54,'joseph chan','modified','HealthWorker_01','2026-01-24 23:31:54'),(55,'Astra Yao','added','HealthWorker_01','2026-01-24 23:34:52'),(56,'Astra Yao','modified','HealthWorker_01','2026-01-24 23:35:59'),(57,'Joseph Chan','modified','HealthWorker_01','2026-01-24 23:47:12'),(58,'RES-5393957-1568','modified','HealthWorker_02','2026-01-27 22:52:38'),(59,'RES-5393957-1568','modified','HealthWorker_02','2026-01-27 23:25:22'),(60,'RES-5393957-1568','modified','HealthWorker_02','2026-01-27 23:31:43'),(61,'RES-1612748-9792','modified','HealthWorker_02','2026-01-27 23:35:29'),(62,'RES-5467767-4509','added','HealthWorker_03','2026-01-28 00:10:22'),(63,'RES-5467767-4509','modified','HealthWorker_03','2026-01-28 00:11:55');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (3,'HealthWorker_01','5523311a07f340a532b16341ed68f46eec641f35775651b097715178f1d81993'),(4,'HealthWorker_02','570e82687c00e6b326af54c571c6721f56e46f5b64c5e95d212e99843618a07d'),(5,'HealthWorker_03','0568c08c7943d455b23764f674f9eb8c773b93c0c77d6fc3b555b08f2dbd9f5c');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_records` (
  `Health_Record_ID` int NOT NULL AUTO_INCREMENT,
  `Resident_ID` varchar(20) NOT NULL,
  `Blood_Pressure` varchar(20) DEFAULT NULL,
  `Weight` decimal(5,2) DEFAULT NULL,
  `Height` decimal(5,2) DEFAULT NULL,
  `BMI` decimal(5,2) DEFAULT NULL,
  `Nutrition_Status` varchar(50) DEFAULT NULL,
  `Health_Condition` enum('Good','Fair','Poor') DEFAULT NULL,
  `Is_PWD` tinyint(1) DEFAULT '0',
  `Allergies` text,
  `Diagnosis` text,
  `Remarks_Notes` text,
  `Date_Visited` date DEFAULT NULL,
  `Date_Registered` datetime DEFAULT CURRENT_TIMESTAMP,
  `Recorded_By` int DEFAULT NULL,
  `last_modified_by` int DEFAULT NULL,
  PRIMARY KEY (`Health_Record_ID`),
  KEY `Resident_ID` (`Resident_ID`),
  CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`Resident_ID`) REFERENCES `residents` (`Resident_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES (2,'RES-1737290-2655',NULL,60.00,165.00,22.04,'Normal','Good',0,'wala','Stomach ache','Avoid Coffee','2026-01-18','2026-01-17 17:47:59',1,NULL),(3,'RES-6625780-8076',NULL,65.00,165.00,23.88,'Normal','Good',0,'wala','Flu','Take a rest','2026-01-18','2026-01-17 17:48:05',1,NULL),(4,'RES-6448176-4131',NULL,45.00,170.00,15.57,'Underweight','Good',0,'wala',NULL,NULL,'2026-01-18','2026-01-17 17:48:13',1,NULL),(5,'RES-4071025-3317','120/80',63.00,157.00,25.56,'Overweight','Good',0,'wala','Sore Throat','Prescribed to avoid sweets ','2026-01-18','2026-01-18 20:15:13',1,NULL),(6,'RES-6724323-7207',NULL,55.00,165.00,20.20,'Normal','Good',0,'Ice','Big personality','nothing','2026-01-18','2026-01-18 20:53:11',2,NULL),(8,'RES-2227150-4177',NULL,40.00,140.00,20.41,'Normal','Poor',1,'None','Amnesia','N/A','2026-01-18','2026-01-18 21:00:00',2,NULL),(9,'RES-9952553-2141','120/80',61.00,179.00,19.04,'Normal','Fair',0,'dust','baliw',NULL,'2026-01-20','2026-01-20 22:18:57',1,NULL),(10,'RES-6084093-5804','145/90',63.00,169.00,22.06,'Normal','Fair',0,'N/A','Hypertension',NULL,'2026-01-22','2026-01-23 00:12:09',1,NULL),(11,'RES-7456767-7293',NULL,60.00,175.00,19.59,'Normal','Good',1,'none',NULL,NULL,'2026-01-24','2026-01-24 16:35:26',1,NULL),(12,'RES-5604453-5222',NULL,65.00,170.00,22.49,'Normal','Fair',1,'N/A',NULL,NULL,'2026-01-24','2026-01-24 16:36:10',1,NULL),(13,'RES-8005798-6595',NULL,65.00,165.00,23.88,'Normal','Good',0,'Chicken',NULL,NULL,'2026-01-24','2026-01-24 16:39:45',1,NULL),(14,'RES-9688995-9828','120/80',67.80,168.00,24.02,'Normal','Poor',1,'None','Cough',NULL,'2026-01-24','2026-01-24 16:56:15',3,NULL),(15,'RES-8931026-5652',NULL,60.00,148.00,27.39,'Overweight','Good',0,'Weak people',NULL,NULL,'2026-01-24','2026-01-24 17:15:19',3,NULL),(16,'RES-5400093-2498','120/80',65.00,165.00,23.88,'Normal','Good',1,NULL,NULL,NULL,'2026-01-24','2026-01-24 17:23:06',3,NULL),(17,'RES-2530333-4988',NULL,65.00,165.00,23.88,'Normal','Good',0,'Sea foods',NULL,NULL,'2026-01-24','2026-01-24 17:29:14',3,NULL),(18,'RES-6444432-1377','120/80',65.00,159.90,25.42,'Overweight','Good',0,NULL,NULL,NULL,'2026-01-23','2026-01-24 17:47:43',3,NULL),(19,'RES-2466622-2472',NULL,65.00,165.00,23.88,'Normal','Good',0,NULL,NULL,NULL,'2026-01-24','2026-01-24 17:49:12',3,NULL),(20,'RES-7024336-4628',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-01-24','2026-01-24 17:54:09',3,NULL),(21,'RES-1612748-9792','110/70',80.00,165.10,29.35,'Overweight','Fair',1,NULL,NULL,NULL,'2026-01-27','2026-01-24 18:16:32',3,4),(22,'RES-5393957-1568','120/80',46.00,155.00,19.15,'Normal','Good',0,'None','Sore Throat',NULL,'2026-01-27','2026-01-24 23:34:52',3,4),(23,'RES-5467767-4509','120/80',60.00,165.00,22.04,'Normal','Good',1,'N/A','Backpain',NULL,'2026-01-28','2026-01-28 00:10:22',5,5);
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_resident`
--

DROP TABLE IF EXISTS `pending_resident`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pending_resident` (
  `Pending_HR_ID` int NOT NULL AUTO_INCREMENT,
  `Resident_ID` varchar(20) NOT NULL,
  `Is_PWD` tinyint(1) DEFAULT '0',
  `Height` decimal(5,2) DEFAULT NULL,
  `Weight` decimal(5,2) DEFAULT NULL,
  `BMI` decimal(5,2) DEFAULT NULL,
  `Health_Condition` enum('Good','Fair','Poor') DEFAULT NULL,
  `Allergies` text,
  `Submitted_At` datetime DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `Verified_By` int DEFAULT NULL,
  PRIMARY KEY (`Pending_HR_ID`),
  KEY `Resident_ID` (`Resident_ID`),
  CONSTRAINT `pending_resident_ibfk_1` FOREIGN KEY (`Resident_ID`) REFERENCES `residents` (`Resident_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_resident`
--

LOCK TABLES `pending_resident` WRITE;
/*!40000 ALTER TABLE `pending_resident` DISABLE KEYS */;
INSERT INTO `pending_resident` VALUES (7,'RES-4479005-5451',0,160.00,49.00,19.14,'Good','None','2026-01-18 12:38:26','Pending',NULL),(9,'RES-9305375-5812',0,165.00,60.00,22.04,'Good','None','2026-01-18 12:40:34','Pending',NULL);
/*!40000 ALTER TABLE `pending_resident` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residents`
--

DROP TABLE IF EXISTS `residents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residents` (
  `Resident_ID` varchar(20) NOT NULL,
  `First_Name` varchar(100) NOT NULL,
  `Middle_Name` varchar(100) DEFAULT NULL,
  `Last_Name` varchar(100) NOT NULL,
  `Sex` enum('Male','Female') NOT NULL,
  `Birthdate` date DEFAULT NULL,
  `Civil_Status` varchar(50) DEFAULT NULL,
  `Contact_Number` varchar(20) DEFAULT NULL,
  `Street_ID` int DEFAULT NULL,
  `Barangay` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Resident_ID`),
  UNIQUE KEY `unique_resident_identity` (`First_Name`,`Middle_Name`,`Last_Name`),
  KEY `fk_street` (`Street_ID`),
  CONSTRAINT `residents_ibfk_street` FOREIGN KEY (`Street_ID`) REFERENCES `streets` (`Street_ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES ('RES-1612748-9792','Joseph','Santos','Chan','Male','2004-05-13','Single','025426544136',1,'Marikina Heights'),('RES-1737290-2655','Johanna Lucia','Villarama','Hizon','Female','2003-12-14','Single','09221212121121',5,'Marikina Heights'),('RES-2227150-4177','Misha','Char','Legwork','Male','2015-04-06','Single','09221212121121',10,'Marikina Heights'),('RES-2466622-2472','mam cy',NULL,'sss','Female','1978-05-08','Married',NULL,NULL,'Marikina Heights'),('RES-2530333-4988','John','Kylle','Clarianes','Male','2026-01-24',NULL,NULL,NULL,'Marikina Heights'),('RES-4071025-3317','Ikki Dominique','.','Modar','Female','2003-02-24','Single','025426544136',7,'Marikina Heights'),('RES-4479005-5451','Evelyn','Smith','Lee','Female',NULL,NULL,NULL,NULL,NULL),('RES-5393957-1568','Astra',NULL,'Yao','Female','2000-07-15','Married','0995-678-4321',1,'Marikina Heights'),('RES-5400093-2498','jose','marie','chan','Female','2020-01-18','Single','0955685',NULL,'Marikina Heights'),('RES-5467767-4509','Kevin','Trio','Reyes','Male','1960-01-28','Single','0917-345-6789',2,'Marikina Heights'),('RES-5604453-5222','Alvin',NULL,'Perezes','Male','2020-01-15','Single',NULL,NULL,'Marikina Heights'),('RES-6084093-5804','Alejandro',NULL,'Reyes','Male','1960-09-15','Single','0917-345-6789',9,'Marikina Heights'),('RES-6444432-1377','marie',NULL,'cy','Male','2000-01-15','Single',NULL,NULL,'Marikina Heights'),('RES-6448176-4131','Nheil Patrick','Tito','Patawaran','Male','2000-02-02',NULL,NULL,1,'Marikina Heights'),('RES-6625780-8076','Jian Vench','Virgo','Palculan','Male','1990-01-18','Single','0917-345-6789',4,'Marikina Heights'),('RES-6724323-7207','Cantarella',NULL,'Fisalia','Female','1999-05-05','Widowed','0917-345-6789',3,'Marikina Heights'),('RES-7024336-4628','mama',NULL,'mia','Female','2004-01-13','Single',NULL,9,'Marikina Heights'),('RES-7456767-7293','Prince',NULL,'Nheil','Male','2004-08-22','Single',NULL,NULL,'Marikina Heights'),('RES-8005798-6595','Marieq',NULL,'Posa','Female','1985-06-12','Married',NULL,NULL,'Marikina Heights'),('RES-8931026-5652','Seijuro','Sota','Akashi','Male','2026-01-23',NULL,NULL,NULL,'Marikina Heights'),('RES-9305375-5812','Luke',NULL,'Hersen','Male',NULL,NULL,NULL,NULL,NULL),('RES-9688995-9828','Justin','Lenard','Timberlake','Male','2000-01-13','Single',NULL,NULL,'Marikina Heights'),('RES-9952553-2141','Jose Emmanuel',NULL,'Hizon','Male','2002-05-21','Single','09995632576',1,'Marikina Heights');
/*!40000 ALTER TABLE `residents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streets`
--

DROP TABLE IF EXISTS `streets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streets` (
  `Street_ID` int NOT NULL AUTO_INCREMENT,
  `Street_Name` varchar(255) NOT NULL,
  `Latitude` decimal(10,8) NOT NULL,
  `Longitude` decimal(11,8) NOT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Street_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streets`
--

LOCK TABLES `streets` WRITE;
/*!40000 ALTER TABLE `streets` DISABLE KEYS */;
INSERT INTO `streets` VALUES (1,'Apitong Street',14.65821227,121.12147766,'2026-01-20 14:07:01'),(2,'Champagnat Street',14.64854821,121.11945110,'2026-01-20 14:07:01'),(3,'Champaca Street',14.65902341,121.12826892,'2026-01-20 14:07:01'),(4,'Dao Street',14.65474914,121.11852474,'2026-01-20 14:07:01'),(5,'Ipil Street',14.65591085,121.11903996,'2026-01-20 14:07:01'),(6,'East Drive Street',14.65514586,121.12116604,'2026-01-20 14:07:01'),(7,'General Ordonez Street',14.65196997,121.11371871,'2026-01-20 14:07:01'),(8,'Liwasang Kalayaan Street',14.64877624,121.11470125,'2026-01-20 14:07:01'),(9,'Narra Street',14.66882298,121.10455466,'2026-01-20 14:07:01'),(10,'P. Valenzuela Street',14.65100107,121.11432684,'2026-01-20 14:07:01');
/*!40000 ALTER TABLE `streets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-28  0:30:56
