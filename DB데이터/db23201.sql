-- MariaDB dump 10.19  Distrib 10.11.4-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: db23201
-- ------------------------------------------------------
-- Server version	10.11.4-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AI`
--

DROP TABLE IF EXISTS `AI`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AI` (
  `version` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `size` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `labels` longblob DEFAULT NULL,
  `result` longblob DEFAULT NULL,
  `confusion_matrix` longblob DEFAULT NULL,
  `F1_curve` longblob DEFAULT NULL,
  `admin_num` int(11) NOT NULL,
  `etc` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`version`),
  KEY `admin_num` (`admin_num`),
  CONSTRAINT `AI_ibfk_1` FOREIGN KEY (`admin_num`) REFERENCES `admin` (`admin_num`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `admin_num` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `id` varchar(30) NOT NULL,
  `passwd` varchar(150) DEFAULT NULL,
  `birth` date DEFAULT NULL,
  `email` varchar(60) NOT NULL,
  `department` varchar(30) DEFAULT NULL,
  `isUsed` char(1) NOT NULL DEFAULT 'Y',
  `isAuth` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`admin_num`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classification`
--

DROP TABLE IF EXISTS `classification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classification` (
  `class_num` int(11) NOT NULL AUTO_INCREMENT,
  `user_num` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `img_bf` longblob NOT NULL,
  `classified` longblob NOT NULL,
  `types_count` int(11) NOT NULL DEFAULT 0,
  `Cardboard` int(11) NOT NULL DEFAULT 0,
  `Plastic_Etc` int(11) NOT NULL DEFAULT 0,
  `Vinyl` int(11) NOT NULL DEFAULT 0,
  `Styrofoam` int(11) NOT NULL DEFAULT 0,
  `Glass` int(11) NOT NULL DEFAULT 0,
  `Beverage_Can` int(11) NOT NULL DEFAULT 0,
  `Canned` int(11) NOT NULL DEFAULT 0,
  `Metal` int(11) NOT NULL DEFAULT 0,
  `Paperboard` int(11) NOT NULL DEFAULT 0,
  `Booklets` int(11) NOT NULL DEFAULT 0,
  `Carton` int(11) NOT NULL DEFAULT 0,
  `Paper_Etc` int(11) NOT NULL DEFAULT 0,
  `Plastic_Container` int(11) NOT NULL DEFAULT 0,
  `Clear_PET` int(11) NOT NULL DEFAULT 0,
  `Colored_PET` int(11) NOT NULL DEFAULT 0,
  `Packaging_Plastic` int(11) NOT NULL DEFAULT 0,
  `feedback` char(1) NOT NULL DEFAULT 'N',
  `feed_star` int(11) DEFAULT NULL,
  PRIMARY KEY (`class_num`),
  KEY `user_num` (`user_num`),
  CONSTRAINT `classification_ibfk_1` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manual`
--

DROP TABLE IF EXISTS `manual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manual` (
  `manual_num` int(11) NOT NULL AUTO_INCREMENT,
  `types` varchar(20) NOT NULL,
  `title` varchar(20) NOT NULL,
  `content` varchar(600) NOT NULL,
  `eligible_item` varchar(300) DEFAULT NULL,
  `ineligible_item` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`manual_num`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `qna`
--

DROP TABLE IF EXISTS `qna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qna` (
  `qna_num` int(11) NOT NULL AUTO_INCREMENT,
  `user_num` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(30) NOT NULL,
  `title` varchar(50) NOT NULL,
  `contents` varchar(300) NOT NULL,
  `attached` longblob DEFAULT NULL,
  `replied` char(1) NOT NULL DEFAULT 'N',
  `reply` varchar(600) DEFAULT NULL,
  `admin_num` int(11) DEFAULT NULL,
  PRIMARY KEY (`qna_num`),
  KEY `user_num` (`user_num`),
  KEY `admin_num` (`admin_num`),
  CONSTRAINT `qna_ibfk_1` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE,
  CONSTRAINT `qna_ibfk_2` FOREIGN KEY (`admin_num`) REFERENCES `admin` (`admin_num`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trashcan`
--

DROP TABLE IF EXISTS `trashcan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trashcan` (
  `trashcan_num` int(11) NOT NULL AUTO_INCREMENT,
  `town_num` int(11) NOT NULL,
  `town` varchar(30) NOT NULL,
  `street` varchar(50) NOT NULL,
  `st_address` varchar(100) NOT NULL,
  `detail` varchar(100) NOT NULL,
  `placed` varchar(50) NOT NULL,
  `types` varchar(20) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  PRIMARY KEY (`trashcan_num`)
) ENGINE=InnoDB AUTO_INCREMENT=4390 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_num` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `nickname` varchar(30) NOT NULL,
  `id` varchar(50) NOT NULL,
  `passwd` varchar(100) NOT NULL,
  `birth` date NOT NULL,
  `email` varchar(600) NOT NULL,
  PRIMARY KEY (`user_num`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yolo`
--

DROP TABLE IF EXISTS `yolo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yolo` (
  `ver_num` int(11) NOT NULL AUTO_INCREMENT,
  `version` varchar(50) NOT NULL,
  `isUsed` char(1) NOT NULL DEFAULT 'N',
  `size` varchar(50) NOT NULL,
  `batch` int(11) NOT NULL,
  `epochs` int(11) NOT NULL,
  `labels` longblob NOT NULL,
  `result` longblob NOT NULL,
  `confusion` longblob NOT NULL,
  `admin_num` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ver_num`),
  KEY `admin_num` (`admin_num`),
  CONSTRAINT `yolo_ibfk_1` FOREIGN KEY (`admin_num`) REFERENCES `admin` (`admin_num`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-03 13:32:43
