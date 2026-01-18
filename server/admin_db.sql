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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,'Ikki Dominique Modar','added','Admin_H1','2026-01-17 17:43:14'),(2,'Ikki Dominique Modar','removed','Admin_H1','2026-01-17 17:44:06'),(3,'Ikki Dominique Modar','removed','Admin_H1','2026-01-17 17:47:54'),(4,'Johanna Lucia Hizon','added','Admin_H1','2026-01-17 17:47:59'),(5,'Jian Vench Palculan','added','Admin_H1','2026-01-17 17:48:05'),(6,'Nheil Patrick Patawaran','added','Admin_H1','2026-01-17 17:48:13'),(7,'Nheil Patrick Patawaran','modified','Admin_H1','2026-01-18 16:21:41'),(8,'Ikki Dominique Modar','added','Admin_H1','2026-01-18 20:15:13'),(9,'Ikki Dominique Modar','modified','Admin_H1','2026-01-18 20:17:56'),(10,'Jian Vench Palculan','modified','Admin_H1','2026-01-18 20:19:33'),(11,'Johanna Lucia Hizon','modified','Admin_H2','2026-01-18 20:34:28'),(12,'Cantarella Fisalia','added','Admin_H2','2026-01-18 20:53:11'),(13,'Cantarella Fisalia','modified','Admin_H2','2026-01-18 20:54:32'),(14,'Raiden Mei','added','Admin_H2','2026-01-18 20:58:19'),(15,'Raiden Mei','modified','Admin_H2','2026-01-18 20:59:25'),(16,'Misha Legwork','added','Admin_H2','2026-01-18 21:00:00'),(17,'Misha Legwork','modified','Admin_H2','2026-01-18 21:00:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES (2,'RES-1737290-2655',NULL,60.00,165.00,22.04,'Normal','Good',0,'wala','Stomach ache','Avoid Coffee','2026-01-18','2026-01-17 17:47:59',1),(3,'RES-6625780-8076',NULL,65.00,165.00,23.88,'Normal','Good',0,'wala','Flu','Take a rest','2026-01-18','2026-01-17 17:48:05',1),(4,'RES-6448176-4131',NULL,45.00,170.00,15.57,'Underweight','Good',0,'wala',NULL,NULL,'2026-01-18','2026-01-17 17:48:13',1),(5,'RES-4071025-3317','120/80',63.00,157.00,25.56,'Overweight','Good',0,'wala','Sore Throat','Prescribed to avoid sweets ','2026-01-18','2026-01-18 20:15:13',1),(6,'RES-6724323-7207',NULL,55.00,165.00,20.20,'Normal','Good',0,'Ice','Big personality','nothing','2026-01-18','2026-01-18 20:53:11',2),(7,'RES-8385132-2389',NULL,51.00,160.00,19.92,'Normal','Good',0,'Black Hole','','Swords woman','2026-01-18','2026-01-18 20:58:19',2),(8,'RES-2227150-4177',NULL,40.00,140.00,20.41,'Normal','Poor',1,'None','Amnesia','N/A','2026-01-18','2026-01-18 21:00:00',2);
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_resident`
--

LOCK TABLES `pending_resident` WRITE;
/*!40000 ALTER TABLE `pending_resident` DISABLE KEYS */;
INSERT INTO `pending_resident` VALUES (7,'RES-4479005-5451',0,160.00,49.00,19.14,'Good','None','2026-01-18 12:38:26','Pending',NULL),(8,'RES-5393957-1568',0,155.00,46.00,19.15,'Good','None','2026-01-18 12:39:39','Pending',NULL),(9,'RES-9305375-5812',0,165.00,60.00,22.04,'Good','None','2026-01-18 12:40:34','Pending',NULL),(10,'RES-2530333-4988',0,165.00,65.00,23.88,'Good','Sea foods','2026-01-18 12:42:14','Pending',NULL),(11,'RES-9688995-9828',0,168.00,50.00,17.72,'Fair','None','2026-01-18 12:43:12','Pending',NULL),(13,'RES-8931026-5652',0,148.00,60.00,27.39,'Good','Weak people','2026-01-18 12:46:08','Pending',NULL),(14,'RES-9544085-5978',0,140.00,45.00,22.96,'Good','Poison','2026-01-18 12:47:43','Pending',NULL);
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
  PRIMARY KEY (`Resident_ID`),
  UNIQUE KEY `unique_resident_identity` (`First_Name`,`Middle_Name`,`Last_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES ('RES-1737290-2655','Johanna Lucia','Villarama','Hizon','Female','2003-12-14','Single','09221212121121','Ipil Street','Marikina Heights'),('RES-2227150-4177','Misha','Char','Legwork','Male','2015-04-06','Single','09221212121121','P. Valenzuela Street','Marikina Heights'),('RES-2530333-4988','John','Kylle','Clarianes','Male',NULL,NULL,NULL,NULL,NULL),('RES-4071025-3317','Ikki Dominique','.','Modar','Female','2003-02-24','Single','025426544136','General Ordonez Street','Marikina Heights'),('RES-4479005-5451','Evelyn','Smith','Lee','Female',NULL,NULL,NULL,NULL,NULL),('RES-5393957-1568','Astra','Shin','Yao','Female',NULL,NULL,NULL,NULL,NULL),('RES-6448176-4131','Nheil Patrick','Tito','Patawaran','Male','2000-02-02',NULL,NULL,'Apitong Street','Marikina Heights'),('RES-6625780-8076','Jian Vench','Virgo','Palculan','Male','1990-01-18','Single','0917-345-6789','Dao Street','Marikina Heights'),('RES-6724323-7207','Cantarella',NULL,'Fisalia','Female','1999-05-05','Widowed','0917-345-6789','Champaca Street','Marikina Heights'),('RES-8385132-2389','Raiden','Bosenmori','Mei','Female','0200-12-05','Single','0917-345-6789','P. Valenzuela Street','Marikina Heights'),('RES-8931026-5652','Seijuro','Sota','Akashi','Male',NULL,NULL,NULL,NULL,NULL),('RES-9305375-5812','Luke',NULL,'Hersen','Male',NULL,NULL,NULL,NULL,NULL),('RES-9544085-5978','Carlotta',NULL,'Montiny','Female',NULL,NULL,NULL,NULL,NULL),('RES-9688995-9828','Justin','Lenard','Timberlake','Male',NULL,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2026-01-18 21:13:34
