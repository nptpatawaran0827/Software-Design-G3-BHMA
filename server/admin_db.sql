CREATE DATABASE  IF NOT EXISTS `admin_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `admin_db`;
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,'boom boom Bang','added','Admin_H1','2026-01-15 00:36:04'),(2,'boom boom Banga','modified','Admin_H1','2026-01-15 00:42:47'),(3,'boons ben','added','System','2026-01-15 00:48:19'),(4,'boons bens','modified','System','2026-01-15 00:48:31'),(5,'boons bens','removed','Admin','2026-01-15 00:48:36'),(6,'beng benmg','added','Admin_H1','2026-01-15 00:52:09'),(7,'neks neks','modified','Admin_H1','2026-01-15 02:57:12'),(8,'neks neks','modified','Admin_H1','2026-01-15 02:57:12'),(9,'hatdog Joshua','added','Admin_H1','2026-01-15 03:00:30'),(10,'hatdog Joshua','added','Admin_H1','2026-01-15 03:00:30'),(11,'hatdogs Joshua','modified','Admin_H1','2026-01-15 03:01:16'),(12,'hatdogs Joshua','modified','Admin_H1','2026-01-15 03:01:16'),(13,'hatdogsss Joshua','modified','Admin_H1','2026-01-15 03:02:55'),(14,'hatdogsss Joshua','modified','Admin_H1','2026-01-15 03:02:55'),(15,'hatdog Joshua','modified','Admin_H1','2026-01-15 03:06:05'),(16,'hatdog Joshua','modified','Admin_H1','2026-01-15 03:06:05'),(17,'hatdog Joshuasss','modified','Admin_H2','2026-01-15 03:06:37'),(18,'hatdog Joshuasss','modified','Admin_H2','2026-01-15 03:06:37'),(19,'hamburger Antok','added','Admin_H2','2026-01-15 03:07:53'),(20,'hamburger Antok','added','Admin_H2','2026-01-15 03:07:53'),(21,'Buti tapos','added','Admin','2026-01-15 03:08:33'),(22,'Buti tapos','added','Admin_H2','2026-01-15 03:08:56'),(23,'Buti tapos','modified','Admin_H2','2026-01-15 03:09:37'),(24,'Buti tapos','modified','Admin_H2','2026-01-15 03:09:37'),(25,'try ko','added','Admin','2026-01-15 03:11:15'),(26,'try  mo','added','Admin','2026-01-15 03:12:41'),(27,'mema vice','added','Admin','2026-01-15 03:15:43'),(28,'pashnea iakw','added','Admin_H1','2026-01-15 03:17:25'),(29,'pashnea iakw','modified','Admin_H1','2026-01-15 03:17:44'),(30,'Sampe ko','added','Admin_H1','2026-01-15 03:53:25'),(31,'Sampe ko','modified','Admin_H1','2026-01-15 03:53:46'),(32,'Sampe ko','modified','Admin_H1','2026-01-15 03:54:23'),(33,'Sampe ko','removed','Admin_H1','2026-01-15 03:54:37'),(34,'samuel hehe','removed','Admin_H1','2026-01-15 03:55:14'),(35,'hamburger Antok','removed','Admin_H1','2026-01-15 03:59:27'),(36,'sample hehe','removed','Admin_H1','2026-01-15 04:05:34');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Admin_H1','34f26e6e8d36cedafae5617bbd69f40963f12986b916e926a4afd5f7567a6707'),(2,'Admin_H2','63537d7fea69535a6abbba097662d374870890f6814de11c840bc7e7d0ffe91d');
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
  PRIMARY KEY (`Health_Record_ID`),
  KEY `Resident_ID` (`Resident_ID`),
  CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`Resident_ID`) REFERENCES `residents` (`Resident_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES (1,'RES-5164913-2641','120/80',65.00,160.00,25.39,'Overweight','Good',0,'N/A','N/A','N/A','2026-01-09','2026-01-13 02:07:28',1),(2,'RES-7117283-7298','120/80',45.00,120.00,31.25,'Obese','Good',1,'N/A','N/A','N/A','2026-01-08','2026-01-13 02:08:28',1),(3,'RES-7812295-6888',NULL,45.00,160.00,17.58,'Underweight','Good',1,'N/A','ubo',NULL,'2026-01-09','2026-01-13 03:27:19',1),(4,'RES-7875757-9987',NULL,65.00,150.00,28.89,'Overweight','Good',0,'manok','tonsils','no sweets\n','2026-01-09','2026-01-13 03:37:34',1),(5,'RES-6268655-3341',NULL,NULL,NULL,NULL,NULL,'Good',1,'N/A','Ubo',NULL,'2026-01-13','2026-01-13 14:21:47',2),(12,'RES-2695654-2358','20',45.00,44.00,232.44,'Obese','Good',1,'N/A','ubo',NULL,'2026-01-11','2026-01-13 18:15:28',1),(13,'RES-2880067-8077','120/80',50.00,135.00,27.43,'Overweight','Fair',0,'N/A','Heart sakit',NULL,'2026-01-13','2026-01-13 18:17:26',1),(14,'RES-7457755-7044',NULL,64.00,160.00,25.00,'Overweight','Good',0,'N/A',NULL,NULL,'2026-01-09','2026-01-13 18:20:53',1),(18,'RES-9540868-6022','120',65.00,165.00,23.88,'Normal','Good',0,'Peanut','Ubo',NULL,'2026-01-11','2026-01-15 03:00:30',2);
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_resident`
--

LOCK TABLES `pending_resident` WRITE;
/*!40000 ALTER TABLE `pending_resident` DISABLE KEYS */;
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
  `Street` varchar(255) DEFAULT NULL,
  `Barangay` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Resident_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES ('RES-1617061-4823','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-1952292-1709','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-2426213-3220','sa',NULL,'as','Female',NULL,NULL,NULL,NULL,NULL),('RES-2605334-4746','Jian Vench',NULL,'Palculan','Male',NULL,NULL,NULL,'Blk6','pansol'),('RES-2695654-2358','bebe',NULL,'ko','Male','1985-01-07','Single','001','P. Valenzuela Street','Pansol'),('RES-2880067-8077','yana',NULL,'portes','Female','2008-12-29','Single','09998882211','P. Valenzuela Street','pasnol'),('RES-2909494-7535','sa',NULL,'as','Female',NULL,NULL,NULL,NULL,NULL),('RES-3189777-9311','sa',NULL,'as','Female',NULL,NULL,NULL,NULL,NULL),('RES-3593991-7763','sa',NULL,'as','Female',NULL,NULL,NULL,NULL,NULL),('RES-4128037-7172','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-4158745-8682','boons',NULL,'bens','Male','2020-01-06',NULL,NULL,'P. Valenzuela Street',NULL),('RES-4684183-5158','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-4714930-7151','Jian Vench','Virgo','Palculan','Male','2012-01-17','Single','09156866402','secret','pansol'),('RES-4790566-1636','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-4954290-2150','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-4970381-1258','boom boom',NULL,'Banga','Male','2020-01-05',NULL,NULL,'P. Valenzuela Street',NULL),('RES-5164913-2641','Jian Vench','Virgo','Palculan','Male','2004-01-14','Single','09156866402','Narra Street','pansol'),('RES-5336652-7463','sa',NULL,'as','Female',NULL,NULL,NULL,NULL,NULL),('RES-5432366-1722','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-5675436-3181','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-6268655-3341','Xian Kyle',NULL,'Pelons','Male','2009-12-30',NULL,NULL,'P. Valenzuela Street','Pansol'),('RES-6488378-4191','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-6836067-6233','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-7117283-7298','hannah','Villarama','hizon','Female','2019-12-23','Single','0111','Champaca Street','pansol'),('RES-7457755-7044','neks',NULL,'neks','Male','2026-01-07',NULL,NULL,'P. Valenzuela Street',NULL),('RES-7569860-4970','sa',NULL,'as','Female',NULL,NULL,NULL,NULL,NULL),('RES-7812295-6888','Nheil patrick','Tito','patawaran','Male','2012-01-04',NULL,NULL,'Champaca Street','pansol'),('RES-7875757-9987','Ikki Dominique',NULL,'Modar','Female','1996-12-29','Single',NULL,'Apitong Street','pansol'),('RES-8059313-3124','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-8087537-7484','sample',NULL,'jiji','Male',NULL,NULL,NULL,NULL,NULL),('RES-8237176-4972','sample',NULL,'jiji','Male',NULL,NULL,NULL,NULL,NULL),('RES-9423099-6910','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL),('RES-9540868-6022','hatdog',NULL,'Joshuasss','Male','2015-01-02','Single','00000','P. Valenzuela Street','Pansol'),('RES-9647119-1245','Jian Vench ','Virgo','Palculan','Male',NULL,NULL,NULL,'Blk5','Pansol'),('RES-9808643-9308','Sample',NULL,'hehe','Male',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `residents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-15  4:06:56
