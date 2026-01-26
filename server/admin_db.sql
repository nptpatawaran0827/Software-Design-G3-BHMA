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
  `Resident_ID` varchar(20) NOT NULL,
  `admin_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `fk_admin_logs` (`admin_id`),
  CONSTRAINT `fk_admin_logs` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'HealthWorker_01','5523311a07f340a532b16341ed68f46eec641f35775651b097715178f1d81993'),(2,'HealthWorker_02','570e82687c00e6b326af54c571c6721f56e46f5b64c5e95d212e99843618a07d'),(3,'HealthWorker_03','0568c08c7943d455b23764f674f9eb8c773b93c0c77d6fc3b555b08f2dbd9f5c');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
SELECT * FROM residents;

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
INSERT INTO `streets` VALUES (1,'Apitong Street',14.65821227,121.12147766,'2026-01-19 22:07:01'),(2,'Champagnat Street',14.64854821,121.11945110,'2026-01-19 22:07:01'),(3,'Champaca Street',14.65902341,121.12826892,'2026-01-19 22:07:01'),(4,'Dao Street',14.65474914,121.11852474,'2026-01-19 22:07:01'),(5,'Ipil Street',14.65591085,121.11903996,'2026-01-19 22:07:01'),(6,'East Drive Street',14.65514586,121.12116604,'2026-01-19 22:07:01'),(7,'General Ordonez Street',14.65196997,121.11371871,'2026-01-19 22:07:01'),(8,'Liwasang Kalayaan Street',14.64877624,121.11470125,'2026-01-19 22:07:01'),(9,'Narra Street',14.65509722,121.11399042,'2026-01-19 22:07:01'),(10,'P. Valenzuela Street',14.65100107,121.11432684,'2026-01-19 22:07:01');
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

-- Dump completed on 2026-01-26  7:03:08
