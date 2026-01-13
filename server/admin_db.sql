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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES (1,'RES-5164913-2641','120/80',65.00,160.00,25.39,'Overweight','Good',0,'N/A','N/A','N/A','2026-01-10','2026-01-13 02:07:28',1),(2,'RES-7117283-7298','120/80',45.00,120.00,31.25,'Obese','Good',1,'N/A','N/A','N/A','2026-01-09','2026-01-13 02:08:28',1),(3,'RES-7812295-6888',NULL,45.00,160.00,17.58,'Underweight','Good',1,'N/A','ubo',NULL,'2026-01-10','2026-01-13 03:27:19',1),(4,'RES-7875757-9987',NULL,65.00,150.00,28.89,'Overweight','Good',0,'manok','tonsils','no sweets\n','2026-01-10','2026-01-13 03:37:34',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
INSERT INTO `residents` VALUES ('RES-2605334-4746','Jian Vench',NULL,'Palculan','Male',NULL,NULL,NULL,'Blk6','pansol'),('RES-4714930-7151','Jian Vench','Virgo','Palculan','Male','2012-01-17','Single','09156866402','secret','pansol'),('RES-5164913-2641','Jian Vench','Virgo','Palculan','Male','2004-01-15','Single','09156866402','Blk 5','pansol'),('RES-7117283-7298','hannah','Villarama','hizon','Female','2019-12-24','Single','0111','Blk6','pansol'),('RES-7812295-6888','Nheil patrick','Tito','patawaran','Male','2012-01-05',NULL,NULL,'Blk6','pansol'),('RES-7875757-9987','Ikki Dominique',NULL,'Modar','Female','1996-12-30','Single',NULL,'blk5','pansol'),('RES-9647119-1245','Jian Vench ','Virgo','Palculan','Male',NULL,NULL,NULL,'Blk5','Pansol');
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

-- Dump completed on 2026-01-13 13:10:49
