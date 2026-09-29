-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: talara
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  KEY `activity_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  KEY `activity_logs_module_action_index` (`module`,`action`),
  KEY `activity_logs_created_at_index` (`created_at`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,'generated','resume','Resume RSM-2026-0001 generated for Michael Otoc Payla','App\\Models\\Resume',1,'{\"template\": \"modern-professional\", \"job_seeker_id\": 1}','2026-06-29 20:35:47','2026-06-29 20:35:47'),(2,9,'template_updated','resume','Resume template changed from \'\' to \'creative\'','App\\Models\\Resume',1,'{\"new_template\": \"creative\", \"old_template\": null}','2026-06-29 20:36:12','2026-06-29 20:36:12'),(3,9,'template_updated','resume','Resume template changed from \'creative\' to \'minimalist\'','App\\Models\\Resume',1,'{\"new_template\": \"minimalist\", \"old_template\": \"creative\"}','2026-06-29 20:37:25','2026-06-29 20:37:25'),(4,9,'template_updated','resume','Resume template changed from \'minimalist\' to \'minimalist\'','App\\Models\\Resume',1,'{\"new_template\": \"minimalist\", \"old_template\": \"minimalist\"}','2026-06-29 20:37:36','2026-06-29 20:37:36'),(5,1,'downloaded','resume','Resume RSM-2026-0001 downloaded','App\\Models\\Resume',1,'{\"template\": \"minimalist\", \"download_count\": 1}','2026-06-29 20:38:02','2026-06-29 20:38:02'),(6,1,'generated','resume','Resume RSM-2026-0002 generated for Michael Otoc Payla','App\\Models\\Resume',1,'{\"template\": \"modern-professional\", \"job_seeker_id\": 1}','2026-06-30 07:42:13','2026-06-30 07:42:13'),(7,1,'deleted','resume','Resume RSM-2026-0002 deleted for Michael Otoc Payla',NULL,NULL,'{\"resume_id\": \"RSM-2026-0002\", \"job_seeker_name\": \"Michael Otoc Payla\"}','2026-07-01 01:03:52','2026-07-01 01:03:52'),(8,1,'generated','resume','Resume RSM-2026-0001 generated for Michael Otoc Payla','App\\Models\\Resume',2,'{\"template\": \"modern-professional\", \"job_seeker_id\": 1}','2026-07-01 01:04:14','2026-07-01 01:04:14'),(9,1,'deleted','resume','Resume RSM-2026-0001 deleted for Michael Otoc Payla',NULL,NULL,'{\"resume_id\": \"RSM-2026-0001\", \"job_seeker_name\": \"Michael Otoc Payla\"}','2026-07-01 01:04:26','2026-07-01 01:04:26'),(10,1,'generated','resume','Resume RSM-2026-0001 generated for Michael Otoc Payla','App\\Models\\Resume',3,'{\"template\": \"minimalist\", \"job_seeker_id\": 1}','2026-07-01 01:04:37','2026-07-01 01:04:37'),(11,9,'template_updated','resume','Resume template changed from \'minimalist\' to \'ats-friendly\'','App\\Models\\Resume',3,'{\"new_template\": \"ats-friendly\", \"old_template\": \"minimalist\"}','2026-07-01 01:21:35','2026-07-01 01:21:35'),(12,9,'template_updated','resume','Resume template changed from \'ats-friendly\' to \'creative\'','App\\Models\\Resume',3,'{\"new_template\": \"creative\", \"old_template\": \"ats-friendly\"}','2026-07-01 01:21:38','2026-07-01 01:21:38'),(13,9,'template_updated','resume','Resume template changed from \'creative\' to \'modern-professional\'','App\\Models\\Resume',3,'{\"new_template\": \"modern-professional\", \"old_template\": \"creative\"}','2026-07-01 01:21:42','2026-07-01 01:21:42'),(14,9,'template_updated','resume','Resume template changed from \'modern-professional\' to \'simple-classic\'','App\\Models\\Resume',3,'{\"new_template\": \"simple-classic\", \"old_template\": \"modern-professional\"}','2026-07-01 01:21:46','2026-07-01 01:21:46'),(15,9,'template_updated','resume','Resume template changed from \'simple-classic\' to \'minimalist\'','App\\Models\\Resume',3,'{\"new_template\": \"minimalist\", \"old_template\": \"simple-classic\"}','2026-07-01 01:21:48','2026-07-01 01:21:48'),(16,1,'generated','resume','Resume RSM-2026-0002 generated for Michael Otoc Payla','App\\Models\\Resume',3,'{\"template\": \"modern-professional\", \"job_seeker_id\": 1}','2026-07-01 20:03:47','2026-07-01 20:03:47'),(17,1,'generated','resume','Resume RSM-2026-0003 generated for Wesley Sanchez Singcol','App\\Models\\Resume',6,'{\"template\": \"creative\", \"job_seeker_id\": 2}','2026-07-01 22:02:30','2026-07-01 22:02:30'),(18,12,'template_updated','resume','Resume template changed from \'\' to \'creative\'','App\\Models\\Resume',6,'{\"new_template\": \"creative\", \"old_template\": null}','2026-07-01 22:03:23','2026-07-01 22:03:23'),(19,12,'template_updated','resume','Resume template changed from \'creative\' to \'ats-friendly\'','App\\Models\\Resume',6,'{\"new_template\": \"ats-friendly\", \"old_template\": \"creative\"}','2026-07-01 22:03:29','2026-07-01 22:03:29'),(20,12,'template_updated','resume','Resume template changed from \'ats-friendly\' to \'ats-friendly\'','App\\Models\\Resume',6,'{\"new_template\": \"ats-friendly\", \"old_template\": \"ats-friendly\"}','2026-07-01 22:03:36','2026-07-01 22:03:36'),(21,1,'generated','resume','Resume RSM-2026-0004 generated for Wesley Sanchez Singcol','App\\Models\\Resume',6,'{\"template\": \"ats-friendly\", \"job_seeker_id\": 2}','2026-07-01 22:03:57','2026-07-01 22:03:57'),(22,1,'generated','resume','Resume RSM-2026-0005 generated for Rave Otoc Payla','App\\Models\\Resume',7,'{\"template\": \"modern-professional\", \"job_seeker_id\": 3}','2026-07-01 22:21:14','2026-07-01 22:21:14'),(23,13,'template_updated','resume','Resume template changed from \'\' to \'creative\'','App\\Models\\Resume',7,'{\"new_template\": \"creative\", \"old_template\": null}','2026-07-01 22:21:59','2026-07-01 22:21:59'),(24,13,'template_updated','resume','Resume template changed from \'creative\' to \'ats-friendly\'','App\\Models\\Resume',7,'{\"new_template\": \"ats-friendly\", \"old_template\": \"creative\"}','2026-07-01 22:22:02','2026-07-01 22:22:02'),(25,1,'downloaded','resume','Resume RSM-2026-0005 downloaded','App\\Models\\Resume',7,'{\"template\": \"ats-friendly\", \"download_count\": 1}','2026-07-01 22:22:29','2026-07-01 22:22:29'),(26,13,'template_updated','resume','Resume template changed from \'ats-friendly\' to \'minimalist\'','App\\Models\\Resume',7,'{\"new_template\": \"minimalist\", \"old_template\": \"ats-friendly\"}','2026-07-01 22:22:40','2026-07-01 22:22:40'),(27,13,'template_updated','resume','Resume template changed from \'minimalist\' to \'creative\'','App\\Models\\Resume',7,'{\"new_template\": \"creative\", \"old_template\": \"minimalist\"}','2026-07-01 22:23:06','2026-07-01 22:23:06'),(28,1,'regenerated','resume','Resume RSM-2026-0005 regenerated for Rave Otoc Payla','App\\Models\\Resume',7,'{\"template\": \"creative\", \"previous_status\": \"updated\"}','2026-07-01 22:27:15','2026-07-01 22:27:15'),(29,1,'generated','resume','Resume RSM-2026-0006 generated for Mailyn Baculio Otox','App\\Models\\Resume',8,'{\"template\": \"modern-professional\", \"job_seeker_id\": 4}','2026-07-01 22:37:30','2026-07-01 22:37:30'),(30,14,'template_updated','resume','Resume template changed from \'\' to \'creative\'','App\\Models\\Resume',8,'{\"new_template\": \"creative\", \"old_template\": null}','2026-07-01 22:37:40','2026-07-01 22:37:40'),(31,14,'template_updated','resume','Resume template changed from \'creative\' to \'modern-professional\'','App\\Models\\Resume',8,'{\"new_template\": \"modern-professional\", \"old_template\": \"creative\"}','2026-07-01 22:38:22','2026-07-01 22:38:22'),(32,14,'template_updated','resume','Resume template changed from \'modern-professional\' to \'minimalist\'','App\\Models\\Resume',8,'{\"new_template\": \"minimalist\", \"old_template\": \"modern-professional\"}','2026-07-01 22:38:41','2026-07-01 22:38:41'),(33,1,'generated','resume','Resume RSM-2026-0007 generated for Mailyn Baculio Otox','App\\Models\\Resume',8,'{\"template\": \"modern-professional\", \"job_seeker_id\": 4}','2026-07-01 22:40:53','2026-07-01 22:40:53'),(34,1,'generated','resume','Resume RSM-2026-0008 generated for Kerby Villalobos Talara','App\\Models\\Resume',9,'{\"template\": \"modern-professional\", \"job_seeker_id\": 5}','2026-07-01 23:23:50','2026-07-01 23:23:50'),(35,15,'template_updated','resume','Resume template changed from \'\' to \'creative\'','App\\Models\\Resume',9,'{\"new_template\": \"creative\", \"old_template\": null}','2026-07-01 23:24:00','2026-07-01 23:24:00'),(36,15,'template_updated','resume','Resume template changed from \'creative\' to \'ats-friendly\'','App\\Models\\Resume',9,'{\"new_template\": \"ats-friendly\", \"old_template\": \"creative\"}','2026-07-01 23:24:55','2026-07-01 23:24:55'),(37,15,'template_updated','resume','Resume template changed from \'ats-friendly\' to \'minimalist\'','App\\Models\\Resume',9,'{\"new_template\": \"minimalist\", \"old_template\": \"ats-friendly\"}','2026-07-01 23:24:58','2026-07-01 23:24:58'),(38,1,'generated','resume','Resume RSM-2026-0009 generated for Kerby Villalobos Talara','App\\Models\\Resume',9,'{\"template\": \"modern-professional\", \"job_seeker_id\": 5}','2026-07-01 23:25:30','2026-07-01 23:25:30'),(39,15,'template_updated','resume','Resume template changed from \'minimalist\' to \'modern-professional\'','App\\Models\\Resume',9,'{\"new_template\": \"modern-professional\", \"old_template\": \"minimalist\"}','2026-07-03 01:25:52','2026-07-03 01:25:52'),(40,1,'downloaded','resume','Resume RSM-2026-0009 downloaded','App\\Models\\Resume',9,'{\"template\": \"modern-professional\", \"download_count\": 1}','2026-07-03 20:53:09','2026-07-03 20:53:09'),(41,1,'regenerated','resume','Resume RSM-2026-0009 regenerated for Kerby Villalobos Talara','App\\Models\\Resume',9,'{\"template\": \"modern-professional\", \"previous_status\": \"updated\"}','2026-07-03 20:53:22','2026-07-03 20:53:22'),(42,1,'regenerated','resume','Resume RSM-2026-0009 regenerated for Kerby Villalobos Talara','App\\Models\\Resume',9,'{\"template\": \"modern-professional\", \"previous_status\": \"generated\"}','2026-07-03 20:53:25','2026-07-03 20:53:25'),(43,1,'regenerated','resume','Resume RSM-2026-0007 regenerated for Mailyn Baculio Otox','App\\Models\\Resume',8,'{\"template\": \"modern-professional\", \"previous_status\": \"generated\"}','2026-07-03 20:53:29','2026-07-03 20:53:29'),(44,1,'regenerated','resume','Resume RSM-2026-0007 regenerated for Mailyn Baculio Otox','App\\Models\\Resume',8,'{\"template\": \"modern-professional\", \"previous_status\": \"generated\"}','2026-07-03 20:53:36','2026-07-03 20:53:36'),(45,1,'regenerated','resume','Resume RSM-2026-0007 regenerated for Mailyn Baculio Otox','App\\Models\\Resume',8,'{\"template\": \"modern-professional\", \"previous_status\": \"generated\"}','2026-07-03 20:53:41','2026-07-03 20:53:41'),(46,15,'template_updated','resume','Resume template changed from \'modern-professional\' to \'minimalist\'','App\\Models\\Resume',9,'{\"new_template\": \"minimalist\", \"old_template\": \"modern-professional\"}','2026-07-06 17:55:37','2026-07-06 17:55:37'),(47,1,'downloaded','resume','Resume RSM-2026-0009 downloaded','App\\Models\\Resume',9,'{\"template\": \"minimalist\", \"download_count\": 2}','2026-07-07 04:04:11','2026-07-07 04:04:11'),(48,1,'downloaded','resume','Resume RSM-2026-0007 downloaded','App\\Models\\Resume',8,'{\"template\": \"modern-professional\", \"download_count\": 1}','2026-07-07 04:04:33','2026-07-07 04:04:33'),(49,1,'deleted','resume','Resume RSM-2026-0007 deleted for Mailyn Baculio Otox',NULL,NULL,'{\"resume_id\": \"RSM-2026-0007\", \"job_seeker_name\": \"Mailyn Baculio Otox\"}','2026-07-07 04:05:09','2026-07-07 04:05:09'),(50,1,'regenerated','resume','Resume RSM-2026-0009 regenerated for Kerby Villalobos Talara','App\\Models\\Resume',9,'{\"template\": \"minimalist\", \"previous_status\": \"updated\"}','2026-07-07 04:05:31','2026-07-07 04:05:31'),(51,1,'downloaded','resume','Resume RSM-2026-0009 downloaded','App\\Models\\Resume',9,'{\"template\": \"minimalist\", \"download_count\": 3}','2026-07-07 20:50:23','2026-07-07 20:50:23'),(52,1,'downloaded','resume','Resume RSM-2026-0009 downloaded','App\\Models\\Resume',9,'{\"template\": \"minimalist\", \"download_count\": 4}','2026-07-07 20:59:59','2026-07-07 20:59:59'),(53,1,'downloaded','resume','Resume RSM-2026-0005 downloaded','App\\Models\\Resume',7,'{\"template\": \"creative\", \"download_count\": 2}','2026-07-07 21:04:00','2026-07-07 21:04:00'),(54,1,'downloaded','resume','Resume RSM-2026-0004 downloaded','App\\Models\\Resume',6,'{\"template\": \"ats-friendly\", \"download_count\": 1}','2026-07-07 21:06:03','2026-07-07 21:06:03'),(55,1,'downloaded','resume','Resume RSM-2026-0002 downloaded','App\\Models\\Resume',3,'{\"template\": \"modern-professional\", \"download_count\": 1}','2026-07-07 21:06:23','2026-07-07 21:06:23'),(56,1,'downloaded','resume','Resume RSM-2026-0002 downloaded','App\\Models\\Resume',3,'{\"template\": \"modern-professional\", \"download_count\": 2}','2026-07-07 21:32:18','2026-07-07 21:32:18'),(57,15,'template_updated','resume','Resume template changed from \'minimalist\' to \'simple-classic\'','App\\Models\\Resume',9,'{\"new_template\": \"simple-classic\", \"old_template\": \"minimalist\"}','2026-07-07 21:40:41','2026-07-07 21:40:41'),(58,15,'template_updated','resume','Resume template changed from \'simple-classic\' to \'modern-professional\'','App\\Models\\Resume',9,'{\"new_template\": \"modern-professional\", \"old_template\": \"simple-classic\"}','2026-07-07 21:40:45','2026-07-07 21:40:45'),(59,15,'template_updated','resume','Resume template changed from \'modern-professional\' to \'minimalist\'','App\\Models\\Resume',9,'{\"new_template\": \"minimalist\", \"old_template\": \"modern-professional\"}','2026-07-07 21:40:47','2026-07-07 21:40:47'),(60,15,'template_updated','resume','Resume template changed from \'minimalist\' to \'modern-professional\'','App\\Models\\Resume',9,'{\"new_template\": \"modern-professional\", \"old_template\": \"minimalist\"}','2026-07-07 21:40:56','2026-07-07 21:40:56'),(61,15,'template_updated','resume','Resume template changed from \'modern-professional\' to \'creative\'','App\\Models\\Resume',9,'{\"new_template\": \"creative\", \"old_template\": \"modern-professional\"}','2026-07-07 21:41:00','2026-07-07 21:41:00'),(62,15,'template_updated','resume','Resume template changed from \'creative\' to \'formal-corporate\'','App\\Models\\Resume',9,'{\"new_template\": \"formal-corporate\", \"old_template\": \"creative\"}','2026-07-07 21:50:41','2026-07-07 21:50:41'),(63,15,'template_updated','resume','Resume template changed from \'formal-corporate\' to \'formal-elegant\'','App\\Models\\Resume',9,'{\"new_template\": \"formal-elegant\", \"old_template\": \"formal-corporate\"}','2026-07-07 21:51:02','2026-07-07 21:51:02'),(64,15,'template_updated','resume','Resume template changed from \'formal-elegant\' to \'formal-traditional\'','App\\Models\\Resume',9,'{\"new_template\": \"formal-traditional\", \"old_template\": \"formal-elegant\"}','2026-07-07 21:51:19','2026-07-07 21:51:19'),(65,15,'template_updated','resume','Resume template changed from \'formal-traditional\' to \'formal-professional\'','App\\Models\\Resume',9,'{\"new_template\": \"formal-professional\", \"old_template\": \"formal-traditional\"}','2026-07-07 21:51:45','2026-07-07 21:51:45'),(66,15,'template_updated','resume','Resume template changed from \'formal-professional\' to \'formal-elegant\'','App\\Models\\Resume',9,'{\"new_template\": \"formal-elegant\", \"old_template\": \"formal-professional\"}','2026-07-07 21:52:00','2026-07-07 21:52:00'),(67,15,'template_updated','resume','Resume template changed from \'formal-elegant\' to \'formal-executive\'','App\\Models\\Resume',9,'{\"new_template\": \"formal-executive\", \"old_template\": \"formal-elegant\"}','2026-07-07 21:52:12','2026-07-07 21:52:12'),(68,1,'generated','resume','Resume RSM-2026-0010 generated for Michael James Talara','App\\Models\\Resume',10,'{\"template\": \"modern-professional\", \"job_seeker_id\": 6}','2026-07-07 22:40:46','2026-07-07 22:40:46'),(69,1,'generated','resume','Resume RSM-2026-0011 generated for Michael James Talara','App\\Models\\Resume',10,'{\"template\": \"modern-professional\", \"job_seeker_id\": 6}','2026-07-07 22:43:23','2026-07-07 22:43:23'),(70,16,'account_approved','notification','job_seeker account approved for occ.talaramichael123@gmail.com',NULL,NULL,'{\"notifiable_id\": 16}','2026-07-07 22:47:44','2026-07-07 22:47:44'),(71,1,'approved','job_seeker','Job Seeker Michael James Talara approved','App\\Models\\JobSeeker',6,NULL,'2026-07-07 22:47:44','2026-07-07 22:47:44'),(72,1,'generated','resume','Resume RSM-2026-0006 generated for Dave Otoc Payla','App\\Models\\Resume',11,'{\"template\": \"modern-professional\", \"job_seeker_id\": 7}','2026-07-08 19:34:24','2026-07-08 19:34:24'),(73,1,'downloaded','resume','Resume RSM-2026-0011 downloaded','App\\Models\\Resume',10,'{\"template\": \"modern-professional\", \"download_count\": 1}','2026-07-08 23:53:03','2026-07-08 23:53:03'),(74,1,'generated','resume','Resume RSM-2026-0007 generated for Marry Joy Payla Galarrira','App\\Models\\Resume',12,'{\"template\": \"modern-professional\", \"job_seeker_id\": 8}','2026-07-09 20:29:21','2026-07-09 20:29:21'),(75,23,'template_updated','resume','Resume template changed from \'\' to \'minimalist\'','App\\Models\\Resume',12,'{\"new_template\": \"minimalist\", \"old_template\": null}','2026-07-09 20:30:10','2026-07-09 20:30:10'),(76,23,'template_updated','resume','Resume template changed from \'minimalist\' to \'minimalist\'','App\\Models\\Resume',12,'{\"new_template\": \"minimalist\", \"old_template\": \"minimalist\"}','2026-07-09 20:30:23','2026-07-09 20:30:23'),(77,23,'template_updated','resume','Resume template changed from \'minimalist\' to \'formal-professional\'','App\\Models\\Resume',12,'{\"new_template\": \"formal-professional\", \"old_template\": \"minimalist\"}','2026-07-09 20:30:40','2026-07-09 20:30:40'),(78,23,'template_updated','resume','Resume template changed from \'formal-professional\' to \'formal-elegant\'','App\\Models\\Resume',12,'{\"new_template\": \"formal-elegant\", \"old_template\": \"formal-professional\"}','2026-07-09 20:32:41','2026-07-09 20:32:41'),(79,23,'template_updated','resume','Resume template changed from \'formal-elegant\' to \'ats-friendly\'','App\\Models\\Resume',12,'{\"new_template\": \"ats-friendly\", \"old_template\": \"formal-elegant\"}','2026-07-09 22:12:26','2026-07-09 22:12:26'),(80,23,'template_updated','resume','Resume template changed from \'ats-friendly\' to \'modern-professional\'','App\\Models\\Resume',12,'{\"new_template\": \"modern-professional\", \"old_template\": \"ats-friendly\"}','2026-07-09 22:13:14','2026-07-09 22:13:14'),(81,1,'generated','resume','Resume RSM-2026-0008 generated for Dennis Talara Salado','App\\Models\\Resume',13,'{\"template\": \"modern-professional\", \"job_seeker_id\": 9}','2026-07-09 22:20:26','2026-07-09 22:20:26'),(82,1,'downloaded','resume','Resume RSM-2026-0008 downloaded','App\\Models\\Resume',13,'{\"template\": \"modern-professional\", \"download_count\": 1}','2026-07-14 22:55:01','2026-07-14 22:55:01'),(83,1,'downloaded','resume','Resume RSM-2026-0008 downloaded','App\\Models\\Resume',13,'{\"template\": \"modern-professional\", \"download_count\": 2}','2026-07-14 23:12:20','2026-07-14 23:12:20'),(84,1,'downloaded','resume','Resume RSM-2026-0009 downloaded','App\\Models\\Resume',9,'{\"template\": \"formal-executive\", \"download_count\": 5}','2026-07-14 23:13:06','2026-07-14 23:13:06'),(85,1,'deleted','resume','Resume RSM-2026-0005 deleted for Rave Otoc Payla',NULL,NULL,'{\"resume_id\": \"RSM-2026-0005\", \"job_seeker_name\": \"Rave Otoc Payla\"}','2026-07-15 00:31:15','2026-07-15 00:31:15'),(86,1,'deleted','resume','Resume RSM-2026-0009 deleted for Kerby Villalobos Talara',NULL,NULL,'{\"resume_id\": \"RSM-2026-0009\", \"job_seeker_name\": \"Kerby Villalobos Talara\"}','2026-07-15 00:31:53','2026-07-15 00:31:53'),(87,27,'template_updated','resume','Resume template changed from \'\' to \'formal-professional\'',NULL,NULL,'{\"new_template\": \"formal-professional\", \"old_template\": null}','2026-07-15 00:43:56','2026-07-15 00:43:56'),(88,27,'template_updated','resume','Resume template changed from \'formal-professional\' to \'formal-professional\'',NULL,NULL,'{\"new_template\": \"formal-professional\", \"old_template\": \"formal-professional\"}','2026-07-15 00:54:34','2026-07-15 00:54:34'),(89,27,'template_updated','resume','Resume template changed from \'formal-professional\' to \'creative\'',NULL,NULL,'{\"new_template\": \"creative\", \"old_template\": \"formal-professional\"}','2026-07-15 00:55:13','2026-07-15 00:55:13'),(90,27,'template_updated','resume','Resume template changed from \'creative\' to \'formal-corporate\'',NULL,NULL,'{\"new_template\": \"formal-corporate\", \"old_template\": \"creative\"}','2026-07-15 00:56:40','2026-07-15 00:56:40'),(91,27,'template_updated','resume','Resume template changed from \'formal-corporate\' to \'minimalist\'',NULL,NULL,'{\"new_template\": \"minimalist\", \"old_template\": \"formal-corporate\"}','2026-07-15 00:59:10','2026-07-15 00:59:10'),(92,27,'template_updated','resume','Resume template changed from \'minimalist\' to \'minimalist\'',NULL,NULL,'{\"new_template\": \"minimalist\", \"old_template\": \"minimalist\"}','2026-07-15 00:59:11','2026-07-15 00:59:11'),(93,27,'template_updated','resume','Resume template changed from \'minimalist\' to \'minimalist\'',NULL,NULL,'{\"new_template\": \"minimalist\", \"old_template\": \"minimalist\"}','2026-07-15 00:59:14','2026-07-15 00:59:14'),(94,1,'generated','resume','Resume RSM-2026-0012 generated for Rommel Goc ong Talara','App\\Models\\Resume',24,'{\"template\": \"modern-professional\", \"job_seeker_id\": 12}','2026-07-15 03:38:36','2026-07-15 03:38:36'),(95,29,'template_updated','resume','Resume template changed from \'\' to \'simple-classic\'','App\\Models\\Resume',24,'{\"new_template\": \"simple-classic\", \"old_template\": null}','2026-07-15 03:39:22','2026-07-15 03:39:22'),(96,1,'downloaded','resume','Resume RSM-2026-0012 downloaded','App\\Models\\Resume',24,'{\"template\": \"simple-classic\", \"download_count\": 1}','2026-07-15 21:29:44','2026-07-15 21:29:44'),(97,1,'generated','resume','Resume RSM-2026-0013 generated for Danny Doydora Payla','App\\Models\\Resume',25,'{\"template\": \"modern-professional\", \"job_seeker_id\": 13}','2026-07-15 21:30:51','2026-07-15 21:30:51'),(98,30,'template_updated','resume','Resume template changed from \'\' to \'creative\'','App\\Models\\Resume',25,'{\"new_template\": \"creative\", \"old_template\": null}','2026-07-15 21:35:06','2026-07-15 21:35:06'),(99,30,'template_updated','resume','Resume template changed from \'creative\' to \'formal-traditional\'','App\\Models\\Resume',25,'{\"new_template\": \"formal-traditional\", \"old_template\": \"creative\"}','2026-07-15 21:35:19','2026-07-15 21:35:19'),(100,30,'template_updated','resume','Resume template changed from \'formal-traditional\' to \'formal-professional\'','App\\Models\\Resume',25,'{\"new_template\": \"formal-professional\", \"old_template\": \"formal-traditional\"}','2026-07-15 21:35:44','2026-07-15 21:35:44'),(101,1,'downloaded','resume','Resume RSM-2026-0004 downloaded','App\\Models\\Resume',6,'{\"template\": \"ats-friendly\", \"download_count\": 2}','2026-07-15 23:03:17','2026-07-15 23:03:17'),(102,1,'generated','resume','Resume RSM-2026-0014 generated for Jan Wesley Sanchez','App\\Models\\Resume',26,'{\"template\": \"modern-professional\", \"job_seeker_id\": 14}','2026-07-16 17:56:33','2026-07-16 17:56:33'),(103,30,'template_updated','resume','Resume template changed from \'formal-professional\' to \'simple-classic\'','App\\Models\\Resume',25,'{\"new_template\": \"simple-classic\", \"old_template\": \"formal-professional\"}','2026-08-26 23:52:26','2026-08-26 23:52:26'),(104,30,'template_updated','resume','Resume template changed from \'simple-classic\' to \'modern-professional\'','App\\Models\\Resume',25,'{\"new_template\": \"modern-professional\", \"old_template\": \"simple-classic\"}','2026-08-26 23:52:32','2026-08-26 23:52:32'),(105,30,'template_updated','resume','Resume template changed from \'modern-professional\' to \'modern-professional\'','App\\Models\\Resume',25,'{\"new_template\": \"modern-professional\", \"old_template\": \"modern-professional\"}','2026-08-26 23:52:33','2026-08-26 23:52:33'),(106,30,'template_updated','resume','Resume template changed from \'modern-professional\' to \'simple-classic\'','App\\Models\\Resume',25,'{\"new_template\": \"simple-classic\", \"old_template\": \"modern-professional\"}','2026-08-26 23:52:33','2026-08-26 23:52:33'),(107,30,'template_updated','resume','Resume template changed from \'simple-classic\' to \'modern-professional\'','App\\Models\\Resume',25,'{\"new_template\": \"modern-professional\", \"old_template\": \"simple-classic\"}','2026-08-26 23:52:34','2026-08-26 23:52:34'),(108,30,'template_updated','resume','Resume template changed from \'modern-professional\' to \'formal-corporate\'','App\\Models\\Resume',25,'{\"new_template\": \"formal-corporate\", \"old_template\": \"modern-professional\"}','2026-08-26 23:55:27','2026-08-26 23:55:27'),(109,1,'generated','resume','Resume RSM-2026-0015 generated for Angelo Talara Ebojo','App\\Models\\Resume',27,'{\"template\": \"modern-professional\", \"job_seeker_id\": 24}','2026-09-28 09:11:21','2026-09-28 09:11:21'),(110,45,'template_updated','resume','Resume template changed from \'\' to \'modern-professional\'','App\\Models\\Resume',27,'{\"new_template\": \"modern-professional\", \"old_template\": null}','2026-09-28 09:47:14','2026-09-28 09:47:14'),(111,45,'template_updated','resume','Resume template changed from \'modern-professional\' to \'modern-professional\'','App\\Models\\Resume',27,'{\"new_template\": \"modern-professional\", \"old_template\": \"modern-professional\"}','2026-09-28 09:47:23','2026-09-28 09:47:23'),(112,45,'template_updated','resume','Resume template changed from \'modern-professional\' to \'modern-professional\'','App\\Models\\Resume',27,'{\"new_template\": \"modern-professional\", \"old_template\": \"modern-professional\"}','2026-09-28 09:48:03','2026-09-28 09:48:03'),(113,45,'template_updated','resume','Resume template changed from \'modern-professional\' to \'modern-professional\'','App\\Models\\Resume',27,'{\"new_template\": \"modern-professional\", \"old_template\": \"modern-professional\"}','2026-09-28 09:55:57','2026-09-28 09:55:57'),(114,45,'template_updated','resume','Resume template changed from \'modern-professional\' to \'modern-professional\'','App\\Models\\Resume',27,'{\"new_template\": \"modern-professional\", \"old_template\": \"modern-professional\"}','2026-09-28 09:56:24','2026-09-28 09:56:24'),(115,45,'template_updated','resume','Resume template changed from \'modern-professional\' to \'formal-executive\'','App\\Models\\Resume',27,'{\"new_template\": \"formal-executive\", \"old_template\": \"modern-professional\"}','2026-09-28 09:56:50','2026-09-28 09:56:50'),(116,45,'template_updated','resume','Resume template changed from \'formal-executive\' to \'formal-executive\'','App\\Models\\Resume',27,'{\"new_template\": \"formal-executive\", \"old_template\": \"formal-executive\"}','2026-09-28 09:56:57','2026-09-28 09:56:57'),(117,45,'template_updated','resume','Resume template changed from \'formal-executive\' to \'formal-executive\'','App\\Models\\Resume',27,'{\"new_template\": \"formal-executive\", \"old_template\": \"formal-executive\"}','2026-09-28 09:56:57','2026-09-28 09:56:57'),(118,45,'template_updated','resume','Resume template changed from \'formal-executive\' to \'formal-executive\'','App\\Models\\Resume',27,'{\"new_template\": \"formal-executive\", \"old_template\": \"formal-executive\"}','2026-09-28 09:56:59','2026-09-28 09:56:59'),(119,45,'template_updated','resume','Resume template changed from \'formal-executive\' to \'creative\'','App\\Models\\Resume',27,'{\"new_template\": \"creative\", \"old_template\": \"formal-executive\"}','2026-09-28 09:57:30','2026-09-28 09:57:30'),(120,45,'template_updated','resume','Resume template changed from \'creative\' to \'simple-classic\'','App\\Models\\Resume',27,'{\"new_template\": \"simple-classic\", \"old_template\": \"creative\"}','2026-09-28 09:57:54','2026-09-28 09:57:54'),(121,1,'downloaded','resume','Resume RSM-2026-0015 downloaded','App\\Models\\Resume',27,'{\"template\": \"simple-classic\", \"download_count\": 1}','2026-09-28 09:58:46','2026-09-28 09:58:46'),(122,45,'template_updated','resume','Resume template changed from \'simple-classic\' to \'simple-classic\'','App\\Models\\Resume',27,'{\"new_template\": \"simple-classic\", \"old_template\": \"simple-classic\"}','2026-09-28 10:40:40','2026-09-28 10:40:40'),(123,45,'template_updated','resume','Resume template changed from \'simple-classic\' to \'simple-classic\'','App\\Models\\Resume',27,'{\"new_template\": \"simple-classic\", \"old_template\": \"simple-classic\"}','2026-09-28 10:57:18','2026-09-28 10:57:18'),(124,45,'template_updated','resume','Resume template changed from \'simple-classic\' to \'formal-corporate\'','App\\Models\\Resume',27,'{\"new_template\": \"formal-corporate\", \"old_template\": \"simple-classic\"}','2026-09-28 12:13:06','2026-09-28 12:13:06');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agencies`
--

DROP TABLE IF EXISTS `agencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agencies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `agency_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `industry_category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agency_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. Recruitment, Staffing, Manpower',
  `license_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `agencies_user_id_foreign` (`user_id`),
  KEY `agencies_barangay_id_foreign` (`barangay_id`),
  KEY `agencies_status_index` (`status`),
  KEY `agencies_reviewed_by_foreign` (`reviewed_by`),
  CONSTRAINT `agencies_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE SET NULL,
  CONSTRAINT `agencies_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `agencies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agencies`
--

LOCK TABLES `agencies` WRITE;
/*!40000 ALTER TABLE `agencies` DISABLE KEYS */;
INSERT INTO `agencies` VALUES (1,8,'Panagatan','Susan','09518452820','susan@gmail.com',NULL,NULL,NULL,12,NULL,NULL,NULL,NULL,NULL,'rejected',NULL,'2026-09-27 06:40:52','asdasdasd',1,'2026-09-08 00:51:45','2026-09-27 06:40:52'),(2,33,'Recruitment Agency','Admin User','09123456789','agency@peso.com','PESO Office, City Hall',NULL,NULL,NULL,NULL,NULL,NULL,'Recruitment','PESO-AGENCY-001','approved',NULL,NULL,NULL,NULL,'2026-09-10 09:06:32','2026-09-24 09:17:00'),(6,49,'Michael\'s Corporated','Michael James Talara','09518452820','occ.talara.michaeljames@gmail.com','Zone 6, Opol Misamis Oriental',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AGY-2026-0001','pending',NULL,NULL,NULL,NULL,'2026-09-27 06:44:24','2026-09-27 06:44:24');
/*!40000 ALTER TABLE `agencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_statuses`
--

DROP TABLE IF EXISTS `application_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `application_id` bigint unsigned NOT NULL,
  `status_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_statuses_application_id_foreign` (`application_id`),
  KEY `application_statuses_status_id_foreign` (`status_id`),
  CONSTRAINT `application_statuses_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `application_statuses_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `hiring_statuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_statuses`
--

LOCK TABLES `application_statuses` WRITE;
/*!40000 ALTER TABLE `application_statuses` DISABLE KEYS */;
INSERT INTO `application_statuses` VALUES (1,4,2,'2026-07-14 20:45:26','2026-07-14 20:45:26'),(2,6,3,'2026-07-15 21:36:18','2026-07-15 21:38:20'),(4,8,4,'2026-09-22 06:44:51','2026-09-22 06:44:51'),(6,10,5,'2026-09-24 23:28:47','2026-09-28 08:43:10'),(7,11,4,'2026-09-28 23:11:44','2026-09-28 23:11:44');
/*!40000 ALTER TABLE `application_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_seeker_id` bigint unsigned NOT NULL,
  `agency_id` bigint unsigned DEFAULT NULL,
  `submitted_by` bigint unsigned DEFAULT NULL,
  `job_id` bigint unsigned NOT NULL,
  `establishment_id` bigint unsigned DEFAULT NULL,
  `application_details` text COLLATE utf8mb4_unicode_ci,
  `expected_salary` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `resume` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','reviewed','shortlisted','interview_scheduled','hired','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `applied_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applications_job_seeker_id_foreign` (`job_seeker_id`),
  KEY `applications_job_id_foreign` (`job_id`),
  KEY `applications_establishment_id_foreign` (`establishment_id`),
  KEY `applications_agency_id_foreign` (`agency_id`),
  KEY `applications_submitted_by_foreign` (`submitted_by`),
  CONSTRAINT `applications_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `applications_establishment_id_foreign` FOREIGN KEY (`establishment_id`) REFERENCES `establishments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_job_seeker_id_foreign` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (3,8,NULL,NULL,15,8,'Good Person',NULL,'2026-07-10',NULL,'pending',NULL,'2026-07-10','2026-07-09 21:46:25','2026-07-09 21:46:25'),(4,9,NULL,NULL,16,8,'I\'m a good person','3000-4000','2026-07-15',NULL,'interview_scheduled','be on time','2026-07-10','2026-07-09 22:24:56','2026-07-14 20:45:26'),(5,12,NULL,NULL,16,8,'good person','500-600','2026-07-16',NULL,'pending',NULL,'2026-07-16','2026-07-15 21:23:27','2026-07-15 21:23:27'),(6,13,NULL,NULL,16,8,'I need this work so that i can help my parents from our expenses','15,000','2026-07-20',NULL,'hired','be on time','2026-07-16','2026-07-15 21:34:24','2026-07-15 21:38:20'),(8,22,NULL,NULL,34,NULL,NULL,NULL,NULL,NULL,'pending',NULL,NULL,'2026-09-22 06:44:51','2026-09-22 06:44:51'),(10,15,2,33,30,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-09-25','2026-09-24 23:28:47','2026-09-24 23:28:47'),(11,22,2,33,31,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-09-29','2026-09-28 23:11:44','2026-09-28 23:11:44');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barangays`
--

DROP TABLE IF EXISTS `barangays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barangays` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `barangay_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `municipality` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barangays_user_id_foreign` (`user_id`),
  CONSTRAINT `barangays_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barangays`
--

LOCK TABLES `barangays` WRITE;
/*!40000 ALTER TABLE `barangays` DISABLE KEYS */;
INSERT INTO `barangays` VALUES (1,NULL,'Awang','Opol',8.4787000,124.4785000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(2,NULL,'Bagocboc','Opol',8.4203000,124.5012000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(3,NULL,'Barra','Opol',8.5084000,124.6072000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(4,NULL,'Bonbon','Opol',8.5246000,124.5708000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(5,NULL,'Cauyonan','Opol',8.3275000,124.4472000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(6,NULL,'Igpit','Opol',8.5095000,124.5879000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(7,NULL,'Limonda','Opol',8.3353000,124.4285000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(8,NULL,'Luyongbonbon','Opol',8.5278000,124.5711000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(9,NULL,'Malanang','Opol',8.4743000,124.5556000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(10,NULL,'Nangcaon','Opol',8.3696000,124.4495000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(11,NULL,'Patag','Opol',8.4924000,124.5540000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(12,NULL,'Poblacion','Opol',8.5202000,124.5735000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(13,NULL,'Taboc','Opol',8.5141000,124.5800000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(14,NULL,'Tingalan','Opol',8.3685000,124.4710000,NULL,NULL,NULL,NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11');
/*!40000 ALTER TABLE `barangays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('peso-employment-management-system-admin-cache-5c785c036466adea360111aa28563bfd556b5fba','i:1;',1790665901),('peso-employment-management-system-admin-cache-5c785c036466adea360111aa28563bfd556b5fba:timer','i:1790665901;',1790665901);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `establishments`
--

DROP TABLE IF EXISTS `establishments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `establishments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `industry_category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `establishments_barangay_id_foreign` (`barangay_id`),
  KEY `establishments_user_id_foreign` (`user_id`),
  CONSTRAINT `establishments_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE CASCADE,
  CONSTRAINT `establishments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `establishments`
--

LOCK TABLES `establishments` WRITE;
/*!40000 ALTER TABLE `establishments` DISABLE KEYS */;
INSERT INTO `establishments` VALUES (4,8,'Panagatan','Susan','09518452820','susan@gmail.com',NULL,NULL,NULL,NULL,NULL,'establishments/logos/dCX2OQZ8kqW208ktPrKSj5ewukA4qTlOYp85adUV.webp',12,'2026-06-29 00:37:36','2026-07-08 05:28:48'),(7,NULL,'7/11','Michael James Talara','09518452820','maximumph21@gmail.com',NULL,NULL,NULL,NULL,NULL,'establishments/logos/U2b2xP5mhFC1AebEuuGiiMcrWPd0r95RMPe8ZvnH.webp',12,'2026-07-08 06:25:36','2026-07-08 06:33:00'),(8,21,'Mcdo','Dave O. Payla','09810608968','daves@gmail.com',NULL,NULL,NULL,NULL,NULL,'establishments/logos/eWGHnfUZ0GLK4tfSGfNTHTiuOkz8woGWjgH5UXSb.webp',13,'2026-07-08 23:10:03','2026-07-09 21:15:43'),(10,31,'PrawnHouse','Michael James Talara','09691825251','jay@gmail.com',NULL,8.5202000,124.5735000,NULL,NULL,NULL,12,'2026-07-16 17:38:50','2026-07-16 17:43:16'),(11,43,'Andokz','Vhinz','09518452820','angel@gmail.com',NULL,8.5202000,124.5735000,NULL,NULL,NULL,12,'2026-09-26 05:03:46','2026-09-26 05:03:46'),(12,44,'Poldos','Tinay','09691825251','angelo@gmail.com',NULL,8.5202000,124.5735000,NULL,NULL,NULL,12,'2026-09-27 04:54:57','2026-09-28 23:04:45');
/*!40000 ALTER TABLE `establishments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hiring_statuses`
--

DROP TABLE IF EXISTS `hiring_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hiring_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hiring_statuses`
--

LOCK TABLES `hiring_statuses` WRITE;
/*!40000 ALTER TABLE `hiring_statuses` DISABLE KEYS */;
INSERT INTO `hiring_statuses` VALUES (1,'interview','2026-07-05 20:02:29','2026-07-05 20:02:29'),(2,'interview_scheduled','2026-07-14 20:45:26','2026-07-14 20:45:26'),(3,'hired','2026-07-15 21:38:20','2026-07-15 21:38:20'),(4,'pending','2026-09-22 06:27:30','2026-09-22 06:27:30'),(5,'for interview','2026-09-28 08:43:10','2026-09-28 08:43:10');
/*!40000 ALTER TABLE `hiring_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `application_id` bigint unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meeting_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('scheduled','rescheduled','cancelled','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `rescheduled_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `interviews_application_id_foreign` (`application_id`),
  CONSTRAINT `interviews_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviews`
--

LOCK TABLES `interviews` WRITE;
/*!40000 ALTER TABLE `interviews` DISABLE KEYS */;
INSERT INTO `interviews` VALUES (2,4,'2026-07-16','10:30:00','7eleven opol street',NULL,'be on time','scheduled',NULL,NULL,NULL,'2026-07-14 20:45:26','2026-07-14 20:45:26'),(3,6,'2026-07-17','10:30:00','Taboc Opol Street',NULL,'be on time','scheduled',NULL,NULL,NULL,'2026-07-15 21:36:18','2026-07-15 21:36:18');
/*!40000 ALTER TABLE `interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `establishment_id` bigint unsigned DEFAULT NULL,
  `agency_id` bigint unsigned DEFAULT NULL,
  `job_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsibilities` text COLLATE utf8mb4_unicode_ci,
  `qualifications` text COLLATE utf8mb4_unicode_ci,
  `required_documents` text COLLATE utf8mb4_unicode_ci,
  `application_instructions` text COLLATE utf8mb4_unicode_ci,
  `benefits` text COLLATE utf8mb4_unicode_ci,
  `working_hours` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_range` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_salary` decimal(12,2) DEFAULT NULL,
  `max_salary` decimal(12,2) DEFAULT NULL,
  `salary_negotiable` tinyint(1) NOT NULL DEFAULT '0',
  `vacant_positions` int NOT NULL DEFAULT '1',
  `required_experience` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_education` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_age` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender_requirement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certifications` text COLLATE utf8mb4_unicode_ci,
  `languages` text COLLATE utf8mb4_unicode_ci,
  `application_deadline` date DEFAULT NULL,
  `employment_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_arrangement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `educational_background` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hiring_status` enum('Open','Hiring','Closed','Filled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Open',
  `status` enum('pending','approved','rejected','active','expired','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `barangay_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_establishment_id_foreign` (`establishment_id`),
  KEY `job_barangay_id_foreign` (`barangay_id`),
  KEY `job_agency_id_foreign` (`agency_id`),
  CONSTRAINT `job_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `job_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_establishment_id_foreign` FOREIGN KEY (`establishment_id`) REFERENCES `establishments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job`
--

LOCK TABLES `job` WRITE;
/*!40000 ALTER TABLE `job` DISABLE KEYS */;
INSERT INTO `job` VALUES (13,4,NULL,'Casher','Brief overview of jobs','List the main responsibilities','List the required qualification',NULL,NULL,'Health Insurance',NULL,'Zone 7 Poblacion','20000-50000','Monthly',20000.00,50000.00,1,2,'3-5 years','Bachelor\'s Degree',NULL,'22-30','female','N/A','N/A','2026-07-08','full_time','On-site','Banking & Finance','Hiring','pending',12,'2026-07-08 05:28:48','2026-07-08 05:28:48'),(14,7,NULL,'Manager','Brief overview of the job','List the main Responsibilities','List the required qualigications',NULL,NULL,'13 month pay',NULL,'Zone 6 Poblacion','30000-60000','Monthly',30000.00,60000.00,1,1,'3-5 years','Master\'s Degree',NULL,'22-35','any','N/A','Filipino','2026-07-08','full_time','On-site','Human Resources','Hiring','pending',12,'2026-07-08 06:33:00','2026-07-08 06:33:00'),(15,8,NULL,'Accountant','Accountant',NULL,NULL,NULL,NULL,'13th month pay',NULL,NULL,NULL,'Weekly',2000.00,3000.00,0,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-10','full_time','On-site','College Level','Hiring','pending',13,'2026-07-09 20:57:26','2026-07-09 20:57:26'),(16,8,NULL,'Crew','Crew',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Weekly',5000.00,6000.00,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-10','part_time',NULL,'Any Educational Background','Hiring','pending',13,'2026-07-09 21:15:43','2026-07-09 21:15:43'),(17,10,NULL,'crew','crew',NULL,NULL,NULL,NULL,'13th month pay',NULL,NULL,NULL,'Monthly',10000.00,20000.00,0,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-17','full_time','On-site','Vocational Graduate','Open','pending',12,'2026-07-16 17:43:16','2026-07-16 17:43:16'),(18,NULL,1,'Customer Service Representative','Handle customer inquiries and complaints via phone, email, and chat.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱15,000 - ₱18,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(19,NULL,1,'Administrative Assistant','Provide administrative support including filing, scheduling, and data entry.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱13,000 - ₱16,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(20,NULL,1,'Warehouse Worker','Receive, store, and distribute materials in warehouse facilities.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(21,NULL,1,'Sales Associate','Assist customers and promote products in retail environment.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(22,NULL,1,'Driver','Transport goods and passengers safely to designated locations.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱14,000 - ₱18,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(23,NULL,1,'Security Guard','Maintain order and enforce rules at establishment premises.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱13,000 - ₱16,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(24,NULL,1,'Production Worker','Operate machinery and assemble products in manufacturing setting.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:01','2026-09-16 10:39:01'),(25,NULL,1,'Cleaner / Janitor','Maintain cleanliness and sanitation of facilities.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱11,000 - ₱13,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(26,NULL,1,'Cashier','Process customer payments and maintain accurate financial records.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(27,NULL,1,'Data Encoder','Input and manage data in computer systems accurately.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱13,000 - ₱16,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(28,NULL,1,'Marketing Assistant','Support marketing campaigns and social media management.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱10,000 - ₱14,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Part-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(29,NULL,1,'Bookkeeper','Maintain financial records and process transactions.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱15,000 - ₱20,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',12,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(30,NULL,2,'Customer Service Representative','Handle customer inquiries and complaints via phone, email, and chat.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱15,000 - ₱18,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(31,NULL,2,'Administrative Assistant','Provide administrative support including filing, scheduling, and data entry.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱13,000 - ₱16,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(32,NULL,2,'Warehouse Worker','Receive, store, and distribute materials in warehouse facilities.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(33,NULL,2,'Sales Associate','Assist customers and promote products in retail environment.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(34,NULL,2,'Driver','Transport goods and passengers safely to designated locations.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱14,000 - ₱18,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(35,NULL,2,'Security Guard','Maintain order and enforce rules at establishment premises.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱13,000 - ₱16,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(36,NULL,2,'Production Worker','Operate machinery and assemble products in manufacturing setting.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(37,NULL,2,'Cleaner / Janitor','Maintain cleanliness and sanitation of facilities.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱11,000 - ₱13,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(38,NULL,2,'Cashier','Process customer payments and maintain accurate financial records.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱12,000 - ₱15,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(39,NULL,2,'Data Encoder','Input and manage data in computer systems accurately.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱13,000 - ₱16,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(40,NULL,2,'Marketing Assistant','Support marketing campaigns and social media management.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱10,000 - ₱14,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Part-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(41,NULL,2,'Bookkeeper','Maintain financial records and process transactions.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱15,000 - ₱20,000',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Full-time',NULL,NULL,'Open','pending',1,'2026-09-16 10:39:02','2026-09-16 10:39:02'),(42,12,NULL,'Casher','Casher',NULL,NULL,NULL,NULL,'13th month pay',NULL,NULL,NULL,NULL,10000.00,20000.00,0,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-29','full_time','On-site','Bachelor\'s Degree in Accountancy','Open','pending',12,'2026-09-28 23:04:45','2026-09-28 23:04:45');
/*!40000 ALTER TABLE `job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_seeker_skills`
--

DROP TABLE IF EXISTS `job_seeker_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_seeker_skills` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_seeker_id` bigint unsigned NOT NULL,
  `skill_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `job_seeker_skills_job_seeker_id_foreign` (`job_seeker_id`),
  KEY `job_seeker_skills_skill_id_foreign` (`skill_id`),
  CONSTRAINT `job_seeker_skills_job_seeker_id_foreign` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_seeker_skills_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_seeker_skills`
--

LOCK TABLES `job_seeker_skills` WRITE;
/*!40000 ALTER TABLE `job_seeker_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_seeker_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_seekers`
--

DROP TABLE IF EXISTS `job_seekers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_seekers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `agency_id` bigint unsigned DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthdate` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `sex` enum('Male','Female','Other','Prefer not to say') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `educational_attainment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_status` enum('Employed','Unemployed','Self-Employed','Underemployed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employer_company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_experience_years` int DEFAULT NULL,
  `preferred_job` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `tesda_nc_certificates` text COLLATE utf8mb4_unicode_ci,
  `other_trainings` text COLLATE utf8mb4_unicode_ci,
  `professional_licenses` text COLLATE utf8mb4_unicode_ci,
  `willing_outside_municipality` tinyint(1) NOT NULL DEFAULT '0',
  `willing_abroad` tinyint(1) NOT NULL DEFAULT '0',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `is_fully_registered` tinyint(1) NOT NULL DEFAULT '0',
  `verification_status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `preferred_template` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_by` bigint unsigned DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_notes` text COLLATE utf8mb4_unicode_ci,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_seekers_user_id_foreign` (`user_id`),
  KEY `job_seekers_barangay_id_foreign` (`barangay_id`),
  KEY `job_seekers_verified_by_foreign` (`verified_by`),
  KEY `job_seekers_agency_id_foreign` (`agency_id`),
  CONSTRAINT `job_seekers_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_seekers_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE SET NULL,
  CONSTRAINT `job_seekers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_seekers_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_seekers`
--

LOCK TABLES `job_seekers` WRITE;
/*!40000 ALTER TABLE `job_seekers` DISABLE KEYS */;
INSERT INTO `job_seekers` VALUES (1,9,NULL,'Michael','Otoc','Payla','2005-04-17',21,'Male','Single','Zone 6 luyong bonbon','09518452820','occ.payladave@gmail.com',5,'2026-06-29 20:35:36','2026-07-14 19:38:44','High School','Unemployed','N/A','N/A',0,'Construction Worker','[\"Electrical / Electronics\", \"Welding / Metal Works\", \"Agriculture / Farming\", \"Fishing / Aquaculture\", \"Construction / Carpentry / Masonry\", \"Driving / Automotive\", \"Computer / IT / Digital Skills\", \"Food Processing / Cooking / Baking\", \"Sewing / Dressmaking\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','minimalist',1,'2026-07-14 19:38:44',NULL,'photos/1ymFGAIt4dCVLmAzro0Wzwbsj9s8mCkS8hVBAlkl.jpg'),(2,12,NULL,'Wesley','Sanchez','Singcol','2005-09-21',20,'Male','Single','Zone 6 Barra','09085864354','occ.payladave@gmail.com',3,'2026-07-01 21:53:03','2026-07-11 03:34:32','High School','Unemployed','Factory Worker','S&R',3,'Casher','[\"Computer / IT / Digital Skills\", \"Electrical / Electronics\", \"Welding / Metal Works\"]','N/A','N/A','N/A',1,1,'N/A',1,'approved','ats-friendly',1,'2026-07-11 03:34:32','NOT QUALIFIED',NULL),(3,13,NULL,'Rave','Otoc','Payla','2004-04-04',22,'Male','Single','Zone 4 Malanang Opol  Misamis Oriental','09810608968','rave@gmail.com',9,'2026-07-01 22:21:14','2026-07-01 22:23:06','College','Unemployed','N/A','N/A',0,'Accountant','[\"Computer / IT / Digital Skills\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','creative',1,'2026-07-01 22:21:32',NULL,NULL),(4,14,NULL,'Mailyn','Baculio','Otox','1982-04-04',44,'Female','Married','Zone 4 Malanang Opol Misamis Oriental','09817561325','mai@gmail.com',9,'2026-07-01 22:37:29','2026-07-03 00:13:50','Post Graduate','Unemployed','N/A','N/A',0,'Cooking','[\"Food Processing / Cooking / Baking\", \"Agriculture / Farming\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','minimalist',1,'2026-07-03 00:13:50',NULL,NULL),(5,15,NULL,'Kerby','Villalobos','Talara','2002-09-04',23,'Male','Single','Zone 6 luyong bonbon','09518452820','kerby@gmail.com',8,'2026-07-01 23:23:50','2026-07-07 21:53:07','College','Unemployed','Delivery','Blueson',6,'Casher','[\"Welding / Metal Works\", \"Electrical / Electronics\", \"Computer / IT / Digital Skills\"]','TESDA','N/A','N/A',1,1,'Please hire me',1,'approved','formal-executive',1,'2026-07-01 23:34:04',NULL,'photos/XFy4GbpqI2LEbCJnnCycUcQyUtti1Oj96NbQyNpe.jpg'),(6,16,NULL,'Michael','James','Talara','2005-04-17',21,'Male','Single','Zone 6 luyong bonbon','09518452820','occ.talaramichael123@gmail.com',8,'2026-07-07 22:40:44','2026-07-15 21:32:09','High School','Unemployed','Factory Worker','Alaska',5,'Manager','[\"Computer / IT / Digital Skills\", \"Electrical / Electronics\", \"Welding / Metal Works\"]','N/A','N/A','N/A',1,1,'N/A',1,'approved',NULL,1,'2026-07-15 21:32:09',NULL,'photos/veShPbjShJ8EEIgUzgpb7lCyGaCLyjoarT3B8yh8.jpg'),(7,20,NULL,'Dave','Otoc','Payla','2003-11-18',22,'Male','Single','Zone 4 Malanang Opol Misamis Oriental','09810688968','evad@gmail.com',9,'2026-07-08 19:34:20','2026-07-11 03:34:43','College','Unemployed','N/A','N/A',0,'Cashier','[\"Computer / IT / Digital Skills\", \"Electrical / Electronics\"]','N/A','N/A','N/A',1,1,NULL,1,'approved',NULL,1,'2026-07-11 03:34:43',NULL,NULL),(8,23,NULL,'Marry Joy','Payla','Galarrira','1982-01-15',44,'Female','Single','Zone 4 Malanang Opol Misamis Oriental','09810060986','marry@gmail.com',9,'2026-07-09 20:29:11','2026-07-15 21:32:11','Post Graduate','Unemployed','N/A','M/A',0,'Accountant','[\"Computer / IT / Digital Skills\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','modern-professional',1,'2026-07-15 21:32:11',NULL,'photos/OU7RjLYICtjqIqHHmtmbKFaUvPBPqOHFy0XBQMmg.jpg'),(9,24,NULL,'Dennis','Talara','Salado','2002-11-23',23,'Male','Single','Zone 6 luyong bonbon','09810608635','dennis@gmail.com',4,'2026-07-09 22:20:23','2026-07-14 20:10:19','College','Unemployed','N/A','N/A',0,'Crew','[\"Computer / IT / Digital Skills\"]','N/A','N/A','N/A',1,1,NULL,1,'approved',NULL,1,'2026-07-09 22:22:42',NULL,'photos/leR8jFE89UEsimbvO97nXugmgDECXpF27habbU9U.jpg'),(10,27,NULL,'Kyriel','Sabanal','Dompor','2003-11-18',22,'Male','Single','Zone 4 Mlanang','09810608968','kyriel@gmail.com',9,'2026-07-15 00:34:38','2026-07-15 01:12:00','College','Unemployed','N//A','N/A',0,'Computer','[\"Computer / IT / Digital Skills\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','minimalist',1,'2026-07-15 01:12:00',NULL,NULL),(11,28,NULL,'Susan','Villalobos','Talara','1990-04-01',36,'Female','Married','zone 6','09691825251','susan@gmail.com',8,'2026-07-15 03:12:47','2026-07-15 03:43:00','College','Unemployed','Cashier','Gaisano',5,'Cashier','[\"Other: Banking\"]','N/A','N/A','N/A',1,1,NULL,1,'approved',NULL,1,'2026-07-15 03:43:00',NULL,NULL),(12,29,NULL,'Rommel','Goc ong','Talara','1990-05-21',36,'Male','Married','zone 6','09518452820','rommel@gmail.com',8,'2026-07-15 03:38:35','2026-07-15 03:40:46','College','Unemployed','Factory worker','S$R',5,'Crew','[\"Food Processing / Cooking / Baking\", \"Computer / IT / Digital Skills\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','simple-classic',1,'2026-07-15 03:40:46',NULL,NULL),(13,30,NULL,'Danny','Doydora','Payla','1982-12-29',43,'Male','Married','Zone 4','09810908968','danny@gmail.com',9,'2026-07-15 21:30:42','2026-08-26 23:55:27','Post Graduate','Unemployed','N/A','N/A',0,'Responders','[\"Computer / IT / Digital Skills\", \"Electrical / Electronics\", \"Welding / Metal Works\", \"Driving / Automotive\", \"Construction / Carpentry / Masonry\"]','N/A','N/A','N/A',1,1,NULL,1,'approved','formal-corporate',1,'2026-07-15 21:31:45',NULL,NULL),(14,32,NULL,'Jan','Wesley','Sanchez','2005-09-17',20,'Male','Single','Zone 8','09664437821','jansanchez@gmail.com',3,'2026-07-16 17:56:22','2026-09-24 23:30:13','College','Unemployed','N/A','N/A',0,'Cashier','[\"Welding / Metal Works\"]','SMAW NC 2','N/A','N/A',1,1,NULL,1,'approved',NULL,1,'2026-09-24 23:30:13',NULL,NULL),(15,34,2,'Michael James',NULL,'Talara',NULL,24,NULL,NULL,'Luyongbonbon','09518452820','noe@gmail.com',8,'2026-09-22 05:48:13','2026-09-28 11:28:38','High School Graduate',NULL,'Tambay',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'Fisherman',0,'pending','formal-elegant',NULL,NULL,NULL,'job-seekers/photos/xkqxQCtyJmgOuEM9NDYcbr4YPfDNtcorrFF6G7HO.jpg'),(19,38,1,'Appear Test',NULL,'Person',NULL,NULL,NULL,NULL,NULL,'09171234567','appeartest_1790087280@example.com',NULL,'2026-09-22 06:28:00','2026-09-28 06:19:26','College Graduate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'Some experience',0,'pending',NULL,NULL,NULL,NULL,NULL),(20,39,1,'Appear Test',NULL,'Person',NULL,NULL,NULL,NULL,NULL,'09171234567','appeartest_1790087303@example.com',NULL,'2026-09-22 06:28:23','2026-09-22 06:28:23','College Graduate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'Some experience',0,'pending',NULL,NULL,NULL,NULL,NULL),(22,41,2,'Dave',NULL,'Payla',NULL,NULL,NULL,NULL,'Malanang','09085864354','dave@gamil.com',9,'2026-09-22 06:44:51','2026-09-22 06:44:51',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'CW',0,'pending',NULL,NULL,NULL,NULL,NULL),(24,45,NULL,'Angelo','Talara','Ebojo','2004-07-08',22,'Male','Single','Zone 4 Luyongbonbon','09667739867','angelo@gmail.com',8,'2026-09-28 09:11:11','2026-09-28 12:13:06','High School','Unemployed','n/a','n/a',0,'Security Guard','[\"Welding / Metal Works\"]','n/a','n/a','n/a',1,0,NULL,1,'approved','formal-corporate',1,'2026-09-28 09:12:34',NULL,NULL);
/*!40000 ALTER TABLE `job_seekers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_skills`
--

DROP TABLE IF EXISTS `job_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_skills` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `skill_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `job_skills_job_id_foreign` (`job_id`),
  KEY `job_skills_skill_id_foreign` (`skill_id`),
  CONSTRAINT `job_skills_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_skills_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_skills`
--

LOCK TABLES `job_skills` WRITE;
/*!40000 ALTER TABLE `job_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,'default','{\"uuid\":\"6ed731fb-14f1-4979-a9f6-1727ccada2aa\",\"displayName\":\"App\\\\Mail\\\\ResumeGenerated\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\ResumeGenerated\\\":2:{s:6:\\\"resume\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:17:\\\"App\\\\Models\\\\Resume\\\";s:2:\\\"id\\\";i:10;s:9:\\\"relations\\\";a:2:{i:0;s:9:\\\"jobSeeker\\\";i:1;s:14:\\\"jobSeeker.user\\\";}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"mailer\\\";s:3:\\\"log\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1783493007,\"delay\":null}',0,NULL,1783493008,1783493008),(2,'default','{\"uuid\":\"a0ea27db-8633-4bc6-b246-3da8545fdc1f\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":5:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:16;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:4:\\\"role\\\";s:10:\\\"job_seeker\\\";s:12:\\\"tempPassword\\\";s:8:\\\"password\\\";s:9:\\\"loginLink\\\";s:27:\\\"http:\\/\\/127.0.0.1:8000\\/login\\\";s:6:\\\"mailer\\\";s:3:\\\"log\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1783493068,\"delay\":null}',0,NULL,1783493068,1783493068),(3,'default','{\"uuid\":\"e0bef663-6494-476a-8d75-8ae0962f305c\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":5:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:16;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:4:\\\"role\\\";s:10:\\\"job_seeker\\\";s:12:\\\"tempPassword\\\";s:8:\\\"password\\\";s:9:\\\"loginLink\\\";s:27:\\\"http:\\/\\/127.0.0.1:8000\\/login\\\";s:6:\\\"mailer\\\";s:3:\\\"log\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1783493264,\"delay\":null}',0,NULL,1783493264,1783493264),(4,'default','{\"uuid\":\"3ab40ae7-cc41-45b8-b9fa-622e8fdfebb9\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784104934,\"delay\":null}',0,NULL,1784104934,1784104934),(5,'default','{\"uuid\":\"cb347435-348f-48ef-93aa-67865d9961ca\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:34:\\\"Account verification not approved.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784104989,\"delay\":null}',0,NULL,1784104989,1784104989),(6,'default','{\"uuid\":\"7b6472f7-5e98-4f5f-9e30-204f34c7ba20\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784105065,\"delay\":null}',0,NULL,1784105065,1784105065),(7,'default','{\"uuid\":\"4513266a-0b6b-45dc-8d2c-bb944478ca35\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:34:\\\"Account verification not approved.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784105355,\"delay\":null}',0,NULL,1784105355,1784105355),(8,'default','{\"uuid\":\"6335237f-33f6-4998-8339-bf45a8be8d5f\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784105573,\"delay\":null}',0,NULL,1784105573,1784105573),(9,'default','{\"uuid\":\"d5127e37-38d7-40cf-aa16-d1bc3d99f59e\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:34:\\\"Account verification not approved.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784106366,\"delay\":null}',0,NULL,1784106366,1784106366),(10,'default','{\"uuid\":\"2d735533-f33e-45ac-a3ff-ec7d71361a0e\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784106376,\"delay\":null}',0,NULL,1784106376,1784106376),(11,'default','{\"uuid\":\"d5eff877-0200-4d91-acec-4dc336bd85b1\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:34:\\\"Account verification not approved.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784106667,\"delay\":null}',0,NULL,1784106667,1784106667),(12,'default','{\"uuid\":\"2ae661cb-4a8e-43db-89e2-ab2125d54161\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:34:\\\"Account verification not approved.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"kyriel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784106712,\"delay\":null}',0,NULL,1784106712,1784106712),(13,'default','{\"uuid\":\"7f342024-8624-4bb3-86d2-0fcf6dff1eed\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:29;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:16:\\\"rommel@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784115656,\"delay\":null}',0,NULL,1784115656,1784115656),(14,'default','{\"uuid\":\"5504ce77-70be-47b2-abf6-7b002c697c39\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:28;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"budoy@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784115780,\"delay\":null}',0,NULL,1784115780,1784115780),(15,'default','{\"uuid\":\"2bcca2a4-cc3f-4be6-8551-3f1cb8b2857b\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:30;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"danny@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784179912,\"delay\":null}',0,NULL,1784179913,1784179913),(16,'default','{\"uuid\":\"b4443ead-a48b-4bf9-abd1-64ebc7b481e5\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:16;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:30:\\\"occ.talaramichael123@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784179930,\"delay\":null}',0,NULL,1784179930,1784179930),(17,'default','{\"uuid\":\"99ed6bac-8b74-45ed-b2dd-20129c3eb9b1\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:23;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"marry@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784179931,\"delay\":null}',0,NULL,1784179931,1784179931),(18,'default','{\"uuid\":\"68c13f93-9560-42d3-945e-80de40fa1dbc\",\"displayName\":\"App\\\\Mail\\\\ApplicationStatusUpdated\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:33:\\\"App\\\\Mail\\\\ApplicationStatusUpdated\\\":3:{s:11:\\\"application\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:22:\\\"App\\\\Models\\\\Application\\\";s:2:\\\"id\\\";i:6;s:9:\\\"relations\\\";a:6:{i:0;s:3:\\\"job\\\";i:1;s:9:\\\"interview\\\";i:2;s:17:\\\"applicationStatus\\\";i:3;s:9:\\\"jobSeeker\\\";i:4;s:14:\\\"jobSeeker.user\\\";i:5;s:13:\\\"establishment\\\";}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"danny@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784180178,\"delay\":null}',0,NULL,1784180178,1784180178),(19,'default','{\"uuid\":\"bc12e32d-f5c6-43c9-a593-86fff76b91b3\",\"displayName\":\"App\\\\Mail\\\\ApplicationStatusUpdated\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:33:\\\"App\\\\Mail\\\\ApplicationStatusUpdated\\\":3:{s:11:\\\"application\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:22:\\\"App\\\\Models\\\\Application\\\";s:2:\\\"id\\\";i:6;s:9:\\\"relations\\\";a:5:{i:0;s:3:\\\"job\\\";i:1;s:17:\\\"applicationStatus\\\";i:2;s:9:\\\"jobSeeker\\\";i:3;s:14:\\\"jobSeeker.user\\\";i:4;s:13:\\\"establishment\\\";}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"danny@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1784180300,\"delay\":null}',0,NULL,1784180300,1784180300),(20,'default','{\"uuid\":\"0ee3773e-f9fd-4ebf-a56b-a8349f271393\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:32;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:20:\\\"jansanchez@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790321415,\"delay\":null}',0,NULL,1790321415,1790321415),(21,'default','{\"uuid\":\"27d60664-685c-445e-b3e4-44e1e8a68397\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:46;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:36:\\\"Permit number could not be verified.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-1bdb5e14@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518816,\"delay\":null}',0,NULL,1790518816,1790518816),(22,'default','{\"uuid\":\"2a9cb8af-86d4-40fc-a7fe-c31d69913c7f\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:46;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-1bdb5e14@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518817,\"delay\":null}',0,NULL,1790518817,1790518817),(23,'default','{\"uuid\":\"49dd9809-2187-460a-8452-4fdc2c0c9121\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:46;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:18:\\\"No reason provided\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-1bdb5e14@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518817,\"delay\":null}',0,NULL,1790518817,1790518817),(24,'default','{\"uuid\":\"9ce4c177-582d-4011-8c60-34a2f5734236\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:46;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-1bdb5e14@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518817,\"delay\":null}',0,NULL,1790518817,1790518817),(25,'default','{\"uuid\":\"d1f2d95b-a0da-46a3-872c-41555720225f\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:47;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:36:\\\"Permit number could not be verified.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-74447066@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518836,\"delay\":null}',0,NULL,1790518836,1790518836),(26,'default','{\"uuid\":\"99ae8ba4-1b60-40e5-bdd5-595a2185ee97\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:47;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-74447066@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518836,\"delay\":null}',0,NULL,1790518836,1790518836),(27,'default','{\"uuid\":\"24e73a14-e681-4ced-acee-244058e7ded1\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:47;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:18:\\\"No reason provided\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-74447066@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518837,\"delay\":null}',0,NULL,1790518837,1790518837),(28,'default','{\"uuid\":\"19d7f590-82d1-4384-a4c2-33e05e42dcb1\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:47;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-74447066@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790518837,\"delay\":null}',0,NULL,1790518837,1790518837),(29,'default','{\"uuid\":\"a9a5a7fe-5dd1-4373-818a-739a2843ce77\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:48;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:36:\\\"Permit number could not be verified.\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-d22f5499@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790519554,\"delay\":null}',0,NULL,1790519554,1790519554),(30,'default','{\"uuid\":\"184b2fe9-ba79-4c71-8bc9-809d8a667972\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:48;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-d22f5499@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790519554,\"delay\":null}',0,NULL,1790519554,1790519554),(31,'default','{\"uuid\":\"f70378b6-1811-469f-95a2-51b474a82576\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:48;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:18:\\\"No reason provided\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-d22f5499@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790519554,\"delay\":null}',0,NULL,1790519554,1790519554),(32,'default','{\"uuid\":\"20cd9a3a-cbd6-4e70-950b-678a50f21241\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:48;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:31:\\\"e2e-approval-d22f5499@peso.test\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790519554,\"delay\":null}',0,NULL,1790519554,1790519554),(33,'default','{\"uuid\":\"83ece31d-57fa-4ad5-a8dd-f05af7828868\",\"displayName\":\"App\\\\Mail\\\\AccountRejected\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountRejected\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:8;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"reason\\\";s:9:\\\"asdasdasd\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"susan@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790520052,\"delay\":null}',0,NULL,1790520052,1790520052),(34,'default','{\"uuid\":\"100de424-0729-45fa-94d6-3ef776a750ad\",\"displayName\":\"App\\\\Mail\\\\AccountApproved\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:24:\\\"App\\\\Mail\\\\AccountApproved\\\":3:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:45;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"tinay@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1790615561,\"delay\":null}',0,NULL,1790615561,1790615561);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_resumes`
--

DROP TABLE IF EXISTS `member_resumes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_resumes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_seeker_id` bigint unsigned NOT NULL,
  `agency_id` bigint unsigned NOT NULL,
  `template` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'modern-professional',
  `content` json DEFAULT NULL,
  `design_options` json DEFAULT NULL,
  `saved_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_resumes_job_seeker_unique` (`job_seeker_id`),
  KEY `member_resumes_agency_id_foreign` (`agency_id`),
  KEY `member_resumes_saved_by_foreign` (`saved_by`),
  CONSTRAINT `member_resumes_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `member_resumes_job_seeker_id_foreign` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `member_resumes_saved_by_foreign` FOREIGN KEY (`saved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_resumes`
--

LOCK TABLES `member_resumes` WRITE;
/*!40000 ALTER TABLE `member_resumes` DISABLE KEYS */;
INSERT INTO `member_resumes` VALUES (1,15,2,'formal-elegant','{\"sex\": null, \"email\": \"noe@gmail.com\", \"skills\": [], \"address\": \"Luyongbonbon\", \"barangay\": \"Luyongbonbon\", \"licenses\": [], \"projects\": [], \"training\": [], \"birthdate\": null, \"full_name\": \"Michael James Talara\", \"references\": [], \"civil_status\": null, \"certifications\": [], \"contact_number\": \"09518452820\", \"work_experience\": [{\"years\": null, \"company\": null, \"position\": \"Fisherman\"}], \"professional_title\": \"Tambay\", \"professional_summary\": null, \"additional_information\": null, \"educational_background\": [{\"year\": null, \"level\": \"High School Graduate\", \"school\": null}]}','{\"font_size\": \"medium\", \"font_family\": \"sans-serif\", \"accent_color\": \"#2563eb\", \"line_spacing\": \"normal\", \"section_order\": [\"professional_summary\", \"education\", \"experience\", \"skills\", \"certifications\", \"training\", \"projects\", \"licenses\", \"references\", \"additional_information\"], \"hidden_sections\": []}',33,'2026-09-28 11:17:54','2026-09-28 11:28:38');
/*!40000 ALTER TABLE `member_resumes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_04_04_014203_create_barangays_table',1),(5,'2026_04_04_014630_create_job_seekers_table',1),(6,'2026_04_04_014811_create_establishments_table',1),(7,'2026_04_04_015314_create_job_table',1),(8,'2026_04_04_020227_create_applications_table',1),(9,'2026_04_04_020532_create_hiring_statuses_table',1),(11,'2026_04_04_021150_create_skills_table',1),(12,'2026_04_04_021341_create_job_seeker_skills_table',1),(13,'2026_04_04_021551_create_job_skills_table',1),(14,'2026_04_28_144500_add_staff_role_to_users_table',1),(15,'2026_05_05_140703_create_personal_access_tokens_table',1),(16,'2026_05_05_162648_add_peso_fields_to_job_seekers_table',1),(17,'2026_05_05_175632_remove_barangay_id_from_job_seekers_table',1),(18,'2026_05_06_020000_remove_barangay_id_from_job_seekers_table',1),(19,'2026_05_08_025500_add_barangay_id_to_job_seekers_table',1),(20,'2026_05_08_103800_restore_barangay_id_and_drop_barangay_name_from_job_seekers_table',1),(21,'2026_05_08_110000_add_barangay_fields_to_barangays_table',1),(22,'2026_05_08_111800_make_user_id_nullable_in_establishments_table',1),(23,'2026_05_08_115700_add_logo_to_establishments_table',1),(24,'2026_05_09_122720_add_status_column_to_applications_table',1),(25,'2026_05_09_125844_add_establishment_id_to_applications_table',1),(26,'2026_05_09_130000_add_hiring_status_to_jobs_table',1),(27,'2026_06_12_110632_add_latitude_longitude_to_barangays_table',1),(28,'2026_06_12_120000_add_location_fields_to_establishments_table',1),(29,'2026_06_17_000001_add_preferred_template_to_job_seekers_table',1),(30,'2026_06_17_000002_create_resumes_table',1),(31,'2026_06_17_114500_fix_barangay_coordinates_copy_to_originals',1),(32,'2026_06_17_130000_create_saved_establishments_table',1),(33,'2026_06_17_152704_make_barangay_id_nullable_in_establishments',1),(37,'2026_06_26_000004_add_verification_fields_to_job_seekers',1),(38,'2026_06_27_000001_add_job_vacancies_fields_to_job_table',2),(39,'2026_06_30_000001_add_photo_url_to_job_seekers_table',3),(40,'2026_06_26_000002_update_resumes_status_enum',4),(41,'2026_06_26_000001_create_activity_logs_table',3),(42,'2026_06_26_000003_add_download_tracking_to_resumes',3),(43,'2026_07_03_000001_create_interviews_table',5),(44,'2026_04_04_020731_create_application_statuses_table',6),(46,'2026_07_08_000001_create_notifications_table',7),(47,'2026_07_08_084051_add_application_fields_to_applications_table',8),(48,'2026_07_08_131607_add_job_form_fields_to_job_table',9),(49,'2026_07_09_082736_add_course_and_documents_fields_to_job_table',10),(50,'2026_07_09_100000_rename_job_category_to_educational_background_in_job_table',11),(51,'2026_09_08_000000_add_description_to_establishments_table',12),(52,'2026_09_09_000000_create_agencies_table',13),(53,'2026_09_09_000001_add_agency_id_to_job_table',13),(54,'2026_09_09_000002_add_agency_to_users_role_enum',14),(55,'2026_09_09_000003_add_city_province_to_agencies_table',15),(56,'2026_09_16_183744_make_establishment_id_nullable_in_job_table',16),(57,'2026_09_22_000001_make_educational_attainment_string_on_job_seekers_table',17),(58,'2026_09_22_000002_add_agency_id_to_job_seekers_table',18),(59,'2026_09_22_000003_add_is_active_to_users_table',19),(60,'2026_09_23_000001_add_agency_and_submitted_by_to_applications_table',20),(61,'2026_09_23_000002_add_member_form_options_to_job_seekers_table',21),(62,'2026_09_25_000000_add_status_to_agencies_table',22),(63,'2026_09_27_000000_add_approval_workflow_to_agencies_table',23),(64,'2026_09_28_000000_create_member_resumes_table',24);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'account_approved','App\\Models\\User',16,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your job_seeker account has been approved. You can now log in to the system.\",\"action_url\":\"http:\\/\\/127.0.0.1:8000\\/login\",\"icon\":\"check-circle\",\"color\":\"green\"}',NULL,'2026-07-07 22:47:44','2026-07-07 22:47:44'),(2,'account_approved','App\\Models\\User',27,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved. You can now log in and start using the system.\"}',NULL,'2026-07-15 00:42:08','2026-07-15 00:42:08'),(3,'account_rejected','App\\Models\\User',27,'{\"type\":\"account_rejected\",\"title\":\"Account Rejected\",\"message\":\"Your account has been rejected. Reason: Account verification not approved.\"}',NULL,'2026-07-15 00:43:09','2026-07-15 00:43:09'),(4,'account_approved','App\\Models\\User',27,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved. You can now log in and start using the system.\"}',NULL,'2026-07-15 00:44:25','2026-07-15 00:44:25'),(5,'account_rejected','App\\Models\\User',27,'{\"type\":\"account_rejected\",\"title\":\"Account Rejected\",\"message\":\"Your account has been rejected. Reason: Account verification not approved.\"}',NULL,'2026-07-15 00:49:15','2026-07-15 00:49:15'),(6,'account_approved','App\\Models\\User',27,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved. You can now log in and start using the system.\"}',NULL,'2026-07-15 00:52:53','2026-07-15 00:52:53'),(7,'account_rejected','App\\Models\\User',27,'{\"type\":\"account_rejected\",\"title\":\"Account Rejected\",\"message\":\"Your account has been rejected. Reason: Account verification not approved.\"}',NULL,'2026-07-15 01:06:06','2026-07-15 01:06:06'),(8,'account_approved','App\\Models\\User',27,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved. You can now log in and start using the system.\"}',NULL,'2026-07-15 01:06:16','2026-07-15 01:06:16'),(9,'account_rejected','App\\Models\\User',27,'{\"type\":\"account_rejected\",\"title\":\"Account Rejected\",\"message\":\"Your account has been rejected. Reason: Account verification not approved.\"}',NULL,'2026-07-15 01:11:07','2026-07-15 01:11:07'),(10,'account_rejected','App\\Models\\User',27,'{\"type\":\"account_rejected\",\"title\":\"Account Rejected\",\"message\":\"Your account has been rejected. Reason: Account verification not approved.\"}',NULL,'2026-07-15 01:11:52','2026-07-15 01:11:52'),(11,'account_approved','App\\Models\\User',29,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-07-15 03:40:46','2026-07-15 03:40:46'),(12,'account_approved','App\\Models\\User',28,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-07-15 03:43:00','2026-07-15 03:43:00'),(13,'new_application','App\\Models\\User',21,'{\"application_id\":5,\"job_seeker_name\":\"Rommel Talara\",\"job_title\":\"Crew\",\"type\":\"new_application\",\"title\":\"New Application Received\",\"message\":\"Rommel Talara applied for Crew.\"}','2026-07-15 21:25:21','2026-07-15 21:23:27','2026-07-15 21:23:27'),(14,'account_approved','App\\Models\\User',30,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-07-15 21:31:45','2026-07-15 21:31:45'),(15,'account_approved','App\\Models\\User',16,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-07-15 21:32:10','2026-07-15 21:32:10'),(16,'account_approved','App\\Models\\User',23,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-07-15 21:32:11','2026-07-15 21:32:11'),(17,'new_application','App\\Models\\User',21,'{\"application_id\":6,\"job_seeker_name\":\"Danny Payla\",\"job_title\":\"Crew\",\"type\":\"new_application\",\"title\":\"New Application Received\",\"message\":\"Danny Payla applied for Crew.\"}',NULL,'2026-07-15 21:34:24','2026-07-15 21:34:24'),(18,'interview_scheduled','App\\Models\\User',30,'{\"application_id\":6,\"job_title\":\"Crew\",\"company_name\":\"Mcdo\",\"interview_date\":\"July 17, 2026\",\"interview_time\":\"10:30\",\"interview_type\":\"On-site\",\"location_or_link\":\"Taboc Opol Street\",\"notes\":\"be on time\",\"type\":\"interview_scheduled\",\"title\":\"Interview Scheduled\",\"message\":\"Your interview for Crew at Mcdo has been scheduled on July 17, 2026 at 10:30 (On-site).\"}',NULL,'2026-07-15 21:36:18','2026-07-15 21:36:18'),(19,'application_status','App\\Models\\User',30,'{\"application_id\":6,\"job_title\":\"Crew\",\"status\":\"hired\",\"company_name\":\"Mcdo\",\"type\":\"application_status\",\"title\":\"Application Status Updated\",\"message\":\"Your application for Crew at Mcdo has been hired.\"}',NULL,'2026-07-15 21:38:20','2026-07-15 21:38:20'),(20,'account_approved','App\\Models\\User',32,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-09-24 23:30:13','2026-09-24 23:30:13'),(33,'account_rejected','App\\Models\\User',8,'{\"agency_id\":1,\"agency_name\":\"Panagatan\",\"status\":\"rejected\",\"reason\":\"asdasdasd\",\"type\":\"account_rejected\",\"title\":\"Agency Account Rejected\",\"message\":\"Your agency account \\\"Panagatan\\\" was rejected by PESO. Reason: asdasdasd\"}',NULL,'2026-09-27 06:40:52','2026-09-27 06:40:52'),(34,'account_approved','App\\Models\\User',45,'{\"type\":\"account_approved\",\"title\":\"Account Approved\",\"message\":\"Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.\"}',NULL,'2026-09-28 09:12:34','2026-09-28 09:12:34');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',9,'mobile-token','a6f7a77869c98ca6bda7a892dd5b11434d1f80af65e666341ee32880d876c12f','[\"*\"]',NULL,NULL,'2026-06-29 20:31:35','2026-06-29 20:31:35'),(2,'App\\Models\\User',9,'mobile-token','11710f74dbb3deed9a75f4f744fdbb652249ad6a7d16f3b238001a7ae5b64554','[\"*\"]','2026-06-29 20:44:58',NULL,'2026-06-29 20:31:54','2026-06-29 20:44:58'),(4,'App\\Models\\User',12,'mobile-token','683ad9ef153930deb2fcf15884f1060815585020a8d1f765861c3286fd92ba4b','[\"*\"]',NULL,NULL,'2026-07-01 21:46:19','2026-07-01 21:46:19'),(5,'App\\Models\\User',12,'mobile-token','44806363116e3b805eba1411dbc867b99e3f79d7150f22882b81d6bbedf2754d','[\"*\"]','2026-07-01 21:54:57',NULL,'2026-07-01 21:46:42','2026-07-01 21:54:57'),(7,'App\\Models\\User',13,'mobile-token','4fff05464c7a807b72711012bb2f4a5bef45555ea21b11f70836901e3ef74054','[\"*\"]',NULL,NULL,'2026-07-01 22:04:56','2026-07-01 22:04:56'),(8,'App\\Models\\User',13,'mobile-token','24c243a9f22f33f1e852242dc6fc98b8af1aa47beb8d7b1ae421c20d4b492018','[\"*\"]','2026-07-01 22:05:13',NULL,'2026-07-01 22:05:10','2026-07-01 22:05:13'),(10,'App\\Models\\User',14,'mobile-token','ea9b5a92afa6cd326646147ee04f18398c5724a9baee6c2c62b84e897b994b6f','[\"*\"]',NULL,NULL,'2026-07-01 22:33:38','2026-07-01 22:33:38'),(11,'App\\Models\\User',14,'mobile-token','dc57ea4c33711bc9ab5a1eb5d7b7eab41839f62d2f2777089d21d7cb4dd45135','[\"*\"]','2026-07-01 22:38:41',NULL,'2026-07-01 22:34:49','2026-07-01 22:38:41'),(12,'App\\Models\\User',15,'mobile-token','a658525599f8165cd50cfdeb0abef1c369730bbebf3c9b38a81a958ec7f026ff','[\"*\"]',NULL,NULL,'2026-07-01 23:20:20','2026-07-01 23:20:20'),(14,'App\\Models\\User',16,'mobile-token','69a3ddea10c5ab5631b398c9b1cf228ec9c8498c68fa8273138fdb834cf16445','[\"*\"]',NULL,NULL,'2026-07-07 22:37:08','2026-07-07 22:37:08'),(17,'App\\Models\\User',19,'mobile-token','60ae7ebbcd3f0e946e5656970dd87a5f0ac55b9b070f695749697c3342a6c4bc','[\"*\"]',NULL,NULL,'2026-07-08 19:30:02','2026-07-08 19:30:02'),(18,'App\\Models\\User',20,'mobile-token','95e341129c75fc2263d92f136fe23bad7b0b28c0044f85a37c35f815564da79e','[\"*\"]',NULL,NULL,'2026-07-08 19:31:24','2026-07-08 19:31:24'),(19,'App\\Models\\User',20,'mobile-token','231665bb408fd7693c3cd9c3078e51afc3b258e43179873993d86a4a093b64c1','[\"*\"]','2026-07-08 19:36:16',NULL,'2026-07-08 19:31:40','2026-07-08 19:36:16'),(20,'App\\Models\\User',23,'mobile-token','fc8b12c197102de97e9f63cd61cfd8a050a1339354451feec3055df329e20aac','[\"*\"]',NULL,NULL,'2026-07-09 20:25:20','2026-07-09 20:25:20'),(22,'App\\Models\\User',24,'mobile-token','95e642c0d77b178745c76570821930ab9e629e3173defeb7adbf5b162eb78de4','[\"*\"]',NULL,NULL,'2026-07-09 22:14:56','2026-07-09 22:14:56'),(23,'App\\Models\\User',24,'mobile-token','ae2b276a20bebc46b73d950f56c485ff25a1c3f7778482bcd0c89d72e963794f','[\"*\"]','2026-07-13 00:39:36',NULL,'2026-07-09 22:15:07','2026-07-13 00:39:36'),(24,'App\\Models\\User',25,'mobile-token','0c49669fe6e5a4494a77f8e37ea8dfdd080b697ae9285c580b0f1b0458074c82','[\"*\"]',NULL,NULL,'2026-07-13 00:46:57','2026-07-13 00:46:57'),(25,'App\\Models\\User',25,'mobile-token','49f6d5ddff2bedfd53ef5d514d6ab96f0d70ad17e92840a30427b4a00e3fc76b','[\"*\"]','2026-07-13 00:53:16',NULL,'2026-07-13 00:47:35','2026-07-13 00:53:16'),(26,'App\\Models\\User',26,'mobile-token','e6002fc90d2a9581b0c173ce484695e129b0fc81415ec1e0f834a8ea0f13037e','[\"*\"]',NULL,NULL,'2026-07-13 08:18:23','2026-07-13 08:18:23'),(29,'App\\Models\\User',27,'mobile-token','2b98a404c991682d91cda15a4dfed1851ae279a9f121d9610af0bd96280a163b','[\"*\"]',NULL,NULL,'2026-07-15 00:29:13','2026-07-15 00:29:13'),(31,'App\\Models\\User',28,'mobile-token','cb3a504bef28eacfe5c401aa133dcbb76faf0a34e4a090d1b557fa88fe13dc08','[\"*\"]',NULL,NULL,'2026-07-15 03:07:59','2026-07-15 03:07:59'),(33,'App\\Models\\User',29,'mobile-token','45632a9a5f9b63ff35b8c569ddcbedc8a945416ed4ba4e595eb1841c1fb895c8','[\"*\"]',NULL,NULL,'2026-07-15 03:35:14','2026-07-15 03:35:14'),(37,'App\\Models\\User',30,'mobile-token','1221d1e2ed5cc97e5fca42b6d760985c47253682a7adf6ca112921091731ea7c','[\"*\"]',NULL,NULL,'2026-07-15 21:26:58','2026-07-15 21:26:58'),(39,'App\\Models\\User',32,'mobile-token','6e4a13ee1dadb9c1a6168e67d7c9e395b00397ac13191c28c1ea53e1ce0b7066','[\"*\"]',NULL,NULL,'2026-07-16 17:51:34','2026-07-16 17:51:34'),(40,'App\\Models\\User',32,'mobile-token','7a785a1a8884267d6ba1e662f1457b9bd5733d56ff059709f4f7734fa3532460','[\"*\"]','2026-07-16 17:52:30',NULL,'2026-07-16 17:51:48','2026-07-16 17:52:30'),(41,'App\\Models\\User',32,'mobile-token','92fdc83102206003446a4550d32b787ecd3645c7691bad60c93f91b3dcd38770','[\"*\"]','2026-09-29 00:51:02',NULL,'2026-07-16 17:54:23','2026-09-29 00:51:02'),(42,'App\\Models\\User',45,'mobile-token','71b939be7c38d9b095ee985d30bb707fd995565882397f9bb7052f28e4e6dc70','[\"*\"]',NULL,NULL,'2026-09-27 05:10:32','2026-09-27 05:10:32'),(44,'App\\Models\\User',45,'mobile-token','7ce68b6a75702cad0ca7deaceabd2a93c7ee81f3c9a8c4cd57760b507d764a10','[\"*\"]','2026-09-28 12:27:05',NULL,'2026-09-27 08:23:36','2026-09-28 12:27:05');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recently_viewed_establishments`
--

DROP TABLE IF EXISTS `recently_viewed_establishments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recently_viewed_establishments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_seeker_id` bigint unsigned NOT NULL,
  `establishment_id` bigint unsigned NOT NULL,
  `viewed_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recently_viewed_establishments_job_seeker_id_foreign` (`job_seeker_id`),
  KEY `recently_viewed_establishments_establishment_id_foreign` (`establishment_id`),
  CONSTRAINT `recently_viewed_establishments_establishment_id_foreign` FOREIGN KEY (`establishment_id`) REFERENCES `establishments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recently_viewed_establishments_job_seeker_id_foreign` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recently_viewed_establishments`
--

LOCK TABLES `recently_viewed_establishments` WRITE;
/*!40000 ALTER TABLE `recently_viewed_establishments` DISABLE KEYS */;
/*!40000 ALTER TABLE `recently_viewed_establishments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resumes`
--

DROP TABLE IF EXISTS `resumes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_seeker_id` bigint unsigned NOT NULL,
  `resume_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` json DEFAULT NULL,
  `status` enum('draft','pending','generated','ready_for_download','downloaded','updated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `generated_by` bigint unsigned DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `downloaded_at` timestamp NULL DEFAULT NULL,
  `download_count` int NOT NULL DEFAULT '0',
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `resumes_resume_id_unique` (`resume_id`),
  KEY `resumes_job_seeker_id_foreign` (`job_seeker_id`),
  KEY `resumes_generated_by_foreign` (`generated_by`),
  CONSTRAINT `resumes_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `resumes_job_seeker_id_foreign` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resumes`
--

LOCK TABLES `resumes` WRITE;
/*!40000 ALTER TABLE `resumes` DISABLE KEYS */;
INSERT INTO `resumes` VALUES (3,1,'RSM-2026-0002','modern-professional','{\"age\": 21, \"sex\": \"Male\", \"email\": \"occ.payladave@gmail.com\", \"skills\": [\"Electrical / Electronics\", \"Welding / Metal Works\", \"Agriculture / Farming\", \"Fishing / Aquaculture\", \"Construction / Carpentry / Masonry\", \"Driving / Automotive\", \"Computer / IT / Digital Skills\", \"Food Processing / Cooking / Baking\", \"Sewing / Dressmaking\"], \"address\": \"Zone 6 luyong bonbon\", \"barangay\": \"Cauyonan\", \"licenses\": [\"N/A\"], \"birthdate\": \"April 17, 2005\", \"full_name\": \"Michael Otoc Payla\", \"last_name\": \"Payla\", \"photo_url\": \"photos/1ymFGAIt4dCVLmAzro0Wzwbsj9s8mCkS8hVBAlkl.jpg\", \"trainings\": [\"N/A\"], \"first_name\": \"Michael\", \"middle_name\": \"Otoc\", \"civil_status\": \"Single\", \"generated_at\": \"July 02, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09518452820\", \"work_experience\": [{\"years\": \"\", \"company\": \"N/A\", \"position\": \"N/A\"}], \"career_objective\": \"Seeking a position as Construction Worker where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"High School\", \"school\": \"Zone 6 luyong bonbon\"}]}','downloaded',1,'2026-07-01 20:03:47','2026-07-07 21:32:18',2,'resumes/RSM-2026-0002.pdf',NULL,'2026-07-01 01:04:37','2026-07-07 21:32:18'),(6,2,'RSM-2026-0004','ats-friendly','{\"age\": 20, \"sex\": \"Male\", \"email\": \"occ.payladave@gmail.com\", \"skills\": [\"Computer / IT / Digital Skills\", \"Electrical / Electronics\", \"Welding / Metal Works\"], \"address\": \"Zone 6 Barra\", \"barangay\": \"Barra\", \"licenses\": [\"N/A\"], \"birthdate\": \"September 21, 2005\", \"full_name\": \"Wesley Sanchez Singcol\", \"last_name\": \"Singcol\", \"photo_url\": null, \"trainings\": [\"N/A\"], \"first_name\": \"Wesley\", \"middle_name\": \"Sanchez\", \"civil_status\": \"Single\", \"generated_at\": \"July 02, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09085864354\", \"work_experience\": [{\"years\": \"3 year(s)\", \"company\": \"S&R\", \"position\": \"Factory Worker\"}], \"career_objective\": \"Seeking a position as Casher where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"High School\", \"school\": \"Zone 6 Barra\"}]}','downloaded',1,'2026-07-01 22:03:57','2026-07-15 23:03:17',2,'resumes/RSM-2026-0004.pdf',NULL,'2026-07-01 22:02:30','2026-07-15 23:03:17'),(10,6,'RSM-2026-0011','modern-professional','{\"age\": 21, \"sex\": \"Male\", \"email\": \"occ.talaramichael123@gmail.com\", \"skills\": [\"Computer / IT / Digital Skills\", \"Electrical / Electronics\", \"Welding / Metal Works\"], \"address\": \"Zone 6 luyong bonbon\", \"barangay\": \"Luyongbonbon\", \"licenses\": [\"N/A\"], \"birthdate\": \"April 17, 2005\", \"full_name\": \"Michael James Talara\", \"last_name\": \"Talara\", \"photo_url\": null, \"trainings\": [\"N/A\"], \"first_name\": \"Michael\", \"middle_name\": \"James\", \"civil_status\": \"Single\", \"generated_at\": \"July 08, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09518452820\", \"photo_full_url\": null, \"work_experience\": [{\"years\": \"5 year(s)\", \"company\": \"Alaska\", \"position\": \"Factory Worker\"}], \"career_objective\": \"Seeking a position as Manager where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"High School\", \"school\": \"Zone 6 luyong bonbon\"}]}','downloaded',1,'2026-07-07 22:43:23','2026-07-08 23:53:03',1,'resumes/RSM-2026-0011.pdf',NULL,'2026-07-07 22:40:46','2026-07-08 23:53:03'),(11,7,'RSM-2026-0006','modern-professional','{\"age\": 22, \"sex\": \"Male\", \"email\": \"evad@gmail.com\", \"skills\": [\"Computer / IT / Digital Skills\", \"Electrical / Electronics\"], \"address\": \"Zone 4 Malanang Opol Misamis Oriental\", \"barangay\": \"Malanang\", \"licenses\": [\"N/A\"], \"birthdate\": \"November 18, 2003\", \"full_name\": \"Dave Otoc Payla\", \"last_name\": \"Payla\", \"trainings\": [\"N/A\"], \"first_name\": \"Dave\", \"middle_name\": \"Otoc\", \"civil_status\": \"Single\", \"generated_at\": \"July 09, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09810688968\", \"work_experience\": [{\"years\": \"\", \"company\": \"N/A\", \"position\": \"N/A\"}], \"career_objective\": \"Seeking a position as Cashier where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"College\", \"school\": \"Zone 4 Malanang Opol Misamis Oriental\"}]}','generated',1,'2026-07-08 19:34:23',NULL,0,'resumes/RSM-2026-0006.pdf',NULL,'2026-07-08 19:34:23','2026-07-08 19:34:23'),(12,8,'RSM-2026-0007','modern-professional','{\"age\": 44, \"sex\": \"Female\", \"email\": \"marry@gmail.com\", \"skills\": [\"Computer / IT / Digital Skills\"], \"address\": \"Zone 4 Malanang Opol Misamis Oriental\", \"barangay\": \"Malanang\", \"licenses\": [\"N/A\"], \"birthdate\": \"January 15, 1982\", \"full_name\": \"Marry Joy Payla Galarrira\", \"last_name\": \"Galarrira\", \"trainings\": [\"N/A\"], \"first_name\": \"Marry Joy\", \"middle_name\": \"Payla\", \"civil_status\": \"Single\", \"generated_at\": \"July 10, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09810060986\", \"work_experience\": [{\"years\": \"\", \"company\": \"M/A\", \"position\": \"N/A\"}], \"career_objective\": \"Seeking a position as Accountant where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"Post Graduate\", \"school\": \"Zone 4 Malanang Opol Misamis Oriental\"}]}','generated',1,'2026-07-09 20:29:21',NULL,0,'resumes/RSM-2026-0007.pdf',NULL,'2026-07-09 20:29:21','2026-07-09 22:13:14'),(13,9,'RSM-2026-0008','modern-professional','{\"age\": 23, \"sex\": \"Male\", \"email\": \"dennis@gmail.com\", \"skills\": [\"Computer / IT / Digital Skills\"], \"address\": \"Zone 6 luyong bonbon\", \"barangay\": \"Bonbon\", \"licenses\": [\"N/A\"], \"birthdate\": \"November 23, 2002\", \"full_name\": \"Dennis Talara Salado\", \"last_name\": \"Salado\", \"trainings\": [\"N/A\"], \"first_name\": \"Dennis\", \"middle_name\": \"Talara\", \"civil_status\": \"Single\", \"generated_at\": \"July 10, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09810608635\", \"work_experience\": [{\"years\": \"\", \"company\": \"N/A\", \"position\": \"N/A\"}], \"career_objective\": \"Seeking a position as Crew where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"College\", \"school\": \"Zone 6 luyong bonbon\"}]}','downloaded',1,'2026-07-09 22:20:26','2026-07-14 23:12:20',2,'resumes/RSM-2026-0008.pdf',NULL,'2026-07-09 22:20:26','2026-07-14 23:12:20'),(24,12,'RSM-2026-0012','simple-classic','{\"age\": 36, \"sex\": \"Male\", \"email\": \"rommel@gmail.com\", \"skills\": [\"Food Processing / Cooking / Baking\", \"Computer / IT / Digital Skills\"], \"address\": \"zone 6\", \"barangay\": \"Luyongbonbon\", \"licenses\": [\"N/A\"], \"birthdate\": \"May 21, 1990\", \"full_name\": \"Rommel Goc ong Talara\", \"last_name\": \"Talara\", \"trainings\": [\"N/A\"], \"first_name\": \"Rommel\", \"references\": [], \"middle_name\": \"Goc ong\", \"civil_status\": \"Married\", \"generated_at\": \"July 15, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09518452820\", \"work_experience\": [{\"years\": \"5 year(s)\", \"company\": \"S$R\", \"position\": \"Factory worker\"}], \"career_objective\": \"Seeking a position as Crew where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"College\", \"school\": \"zone 6\"}]}','downloaded',1,'2026-07-15 03:38:36','2026-07-15 21:29:44',1,'resumes/RSM-2026-0012.pdf',NULL,'2026-07-15 03:38:36','2026-07-15 21:29:44'),(25,13,'RSM-2026-0013','formal-corporate','{\"age\": 43, \"sex\": \"Male\", \"email\": \"danny@gmail.com\", \"skills\": [\"Computer / IT / Digital Skills\", \"Electrical / Electronics\", \"Welding / Metal Works\", \"Driving / Automotive\", \"Construction / Carpentry / Masonry\"], \"address\": \"Zone 4\", \"barangay\": \"Malanang\", \"licenses\": [\"N/A\"], \"birthdate\": \"December 29, 1982\", \"full_name\": \"Danny Doydora Payla\", \"last_name\": \"Payla\", \"trainings\": [\"N/A\"], \"first_name\": \"Danny\", \"references\": [], \"middle_name\": \"Doydora\", \"civil_status\": \"Married\", \"generated_at\": \"July 16, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"N/A\"], \"contact_number\": \"09810908968\", \"work_experience\": [{\"years\": \"\", \"company\": \"N/A\", \"position\": \"N/A\"}], \"career_objective\": \"Seeking a position as Responders where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"Post Graduate\", \"school\": \"Zone 4\"}]}','generated',1,'2026-07-15 21:30:51',NULL,0,'resumes/RSM-2026-0013.pdf',NULL,'2026-07-15 21:30:51','2026-08-26 23:55:27'),(26,14,'RSM-2026-0014','modern-professional','{\"age\": 20, \"sex\": \"Male\", \"email\": \"jansanchez@gmail.com\", \"skills\": [\"Welding / Metal Works\"], \"address\": \"Zone 8\", \"barangay\": \"Barra\", \"licenses\": [\"N/A\"], \"birthdate\": \"September 17, 2005\", \"full_name\": \"Jan Wesley Sanchez\", \"last_name\": \"Sanchez\", \"trainings\": [\"N/A\"], \"first_name\": \"Jan\", \"references\": [], \"middle_name\": \"Wesley\", \"civil_status\": \"Single\", \"generated_at\": \"July 17, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"SMAW NC 2\"], \"contact_number\": \"09664437821\", \"work_experience\": [{\"years\": \"\", \"company\": \"N/A\", \"position\": \"N/A\"}], \"career_objective\": \"Seeking a position as Cashier where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"College\", \"school\": \"Zone 8\"}]}','generated',1,'2026-07-16 17:56:33',NULL,0,'resumes/RSM-2026-0014.pdf',NULL,'2026-07-16 17:56:33','2026-07-16 17:56:33'),(27,24,'RSM-2026-0015','formal-corporate','{\"age\": 22, \"sex\": \"Male\", \"email\": \"angelo@gmail.com\", \"skills\": [\"Welding / Metal Works\"], \"address\": \"Zone 4 Luyongbonbon\", \"barangay\": \"Luyongbonbon\", \"licenses\": [\"n/a\"], \"birthdate\": \"July 08, 2004\", \"full_name\": \"Angelo Talara Ebojo\", \"last_name\": \"Ebojo\", \"trainings\": [\"n/a\"], \"first_name\": \"Angelo\", \"references\": [], \"middle_name\": \"Talara\", \"civil_status\": \"Single\", \"generated_at\": \"September 28, 2026\", \"municipality\": \"Opol, Misamis Oriental\", \"profile_photo\": null, \"certifications\": [\"n/a\"], \"contact_number\": \"09667739867\", \"work_experience\": [{\"years\": \"\", \"company\": \"n/a\", \"position\": \"n/a\"}], \"career_objective\": \"Seeking a position as Security Guard where I can utilize my skills and experience to contribute to organizational growth.\", \"educational_background\": [{\"year\": \"\", \"level\": \"High School\", \"school\": \"Zone 4 Luyongbonbon\"}]}','downloaded',1,'2026-09-28 09:11:21','2026-09-28 09:58:46',1,'resumes/RSM-2026-0015.pdf',NULL,'2026-09-28 09:11:21','2026-09-28 12:13:06');
/*!40000 ALTER TABLE `resumes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_establishments`
--

DROP TABLE IF EXISTS `saved_establishments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_establishments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_seeker_id` bigint unsigned NOT NULL,
  `establishment_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_establishments_job_seeker_id_establishment_id_unique` (`job_seeker_id`,`establishment_id`),
  KEY `saved_establishments_establishment_id_foreign` (`establishment_id`),
  CONSTRAINT `saved_establishments_establishment_id_foreign` FOREIGN KEY (`establishment_id`) REFERENCES `establishments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_establishments_job_seeker_id_foreign` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_establishments`
--

LOCK TABLES `saved_establishments` WRITE;
/*!40000 ALTER TABLE `saved_establishments` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_establishments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('3EG4LxKlcIFNjaSeMSyJJh5vZZndoZDrmIxBTJVw',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTDRYcUlJQ3doeU1BcjNIMHdCMGJuWDljTGxZVzZzR1VaNktGWlpxRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvbm90aWZpY2F0aW9ucyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9',1790686692),('H7bINXxc0YKx5VTh7WIr3nPlszgRoIBgWiksXbgp',33,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiQ2lJWDlNbWhXcU1mc25yTmpORDNuUThHTWpZVDlhSndoQXgxRVNiMCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czozOiJ1cmwiO2E6MDp7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjMzO30=',1790672413),('HJ7UQYrOzNCReh8HpGYoi4xIcIFFlvJN4EDzHbP3',44,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoibm5nVGZ2aUJxMTRhTFY2ZW5YRThZTk9qRUFjSGRaTjNIb1VWeXFHNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9lc3RhYmxpc2htZW50L2hpcmluZy1zdGF0dXMiO3M6NToicm91dGUiO3M6Mjc6ImVzdGFibGlzaG1lbnQuaGlyaW5nLXN0YXR1cyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjQ0O30=',1790686692),('RrrUxhJwkadsvkDiKnVHrvc3jcVgO2wxDDBCh3O3',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.139.1 Chrome/150.0.7871.250 Electron/43.6.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTFRCSjZnQVVzV1pTejlDemJMTEs5dUc2UTkyZlVZaWxPMnB3M2l3dyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1790656427),('sT9xYcIlH145ZcIsktoPyoLSbfR6Tb1hlWmDQtku',NULL,'10.253.240.27','okhttp/4.12.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiS0lMTjB4UmJ4YmFrY1VCRFA5QmdZQWVkaXlxQ1Vkb0JrZE1RbkNBVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly8xMC4yNTMuMjQwLjYyOjgwMDAvYXBpL25vdGlmaWNhdGlvbnMiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1790671592),('VXWWTnbWKt1zeM5Hxn7DuKJdDdKxIllXGi0OAJOq',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.139.1 Chrome/150.0.7871.250 Electron/43.6.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2w1ZXR4bFZXTjBLZmpFbGloVTR3RURreVl6WXJlYVR4TlVsUk5TeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9wZXNvLWxvZ2luIjtzOjU6InJvdXRlIjtzOjEwOiJwZXNvLmxvZ2luIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1790680075);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `role` enum('admin','baranggay','staff','job_seeker','Establishment','Agency') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'job_seeker',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'PESO Administrator','peso.admin@example.com','2026-06-25 17:50:09','$2y$12$VmwP0lQVeeAVi22pmQazo.r3jcfCf0OMGc8Ra55oPne8a19.zI6kG',1,'admin','QCvSxi0HRcIC0kaFrPOTV8cSqUYOnPEPOwIDK74l00onvowxuoYz3s37QUII','2026-06-25 17:50:10','2026-06-25 17:50:10'),(2,'Admin','admin123@gmail.com',NULL,'$2y$12$S2pUpg0we.ho.PFiZfav0.mScZG1H.IOrijqq9iyeiXslJZaLCRIC',1,'admin',NULL,'2026-06-25 17:50:11','2026-06-25 17:50:11'),(8,'Panagatan','susan@gmail.com',NULL,'$2y$12$YBJjBReCewRy8Oqju/646euyLTf5fXmPBTELsfeIvOSFwNmWOc2m2',1,'Agency',NULL,'2026-06-29 00:37:36','2026-06-29 02:41:52'),(9,'Michael James Talara','mik@gmail.com',NULL,'$2y$12$iuFajsVsCy8BzT09TdhbV.wmxT4p2DWmv986T4gWV0fhDjom8H5eC',1,'job_seeker',NULL,'2026-06-29 20:31:34','2026-06-29 20:31:34'),(12,'Dave','wes@gmail.com',NULL,'$2y$12$/l6W4L/gLYMfngCvQXCalOiv0WtoPWOTrZ7t2chldtH0cnupet2Sy',1,'job_seeker',NULL,'2026-07-01 21:46:18','2026-07-01 21:46:18'),(13,'DAN','dan@gmail.com',NULL,'$2y$12$7RmTRCXMn8XIpwbLoje4O.UY9xtXHsfD/a1PrvwUl87r.5G3tj9Dm',1,'job_seeker',NULL,'2026-07-01 22:04:56','2026-07-01 22:04:56'),(14,'Mai','mai@gmail.com',NULL,'$2y$12$UlKEWZPd1CjAcHE8ofmhhOEoZUwV04sOUnY/nsH9ZHb6Zp4TM68D2',1,'job_seeker',NULL,'2026-07-01 22:33:38','2026-07-01 22:33:38'),(15,'Kerby','kerb@gmail.com',NULL,'$2y$12$8XmzGioU6zRIapQWLpy7OOc2Ud0krukA2Bsn1dTg.fq5ttEQcD.aW',1,'job_seeker',NULL,'2026-07-01 23:20:20','2026-07-01 23:20:20'),(16,'Michael James Talara','occ.talaramichael123@gmail.com',NULL,'$2y$12$1ueRZ8aFV7fu4mRqG7A6DuUsqsAB2peGAwsB1K5g4tMwwK54yhAaC',1,'job_seeker',NULL,'2026-07-07 22:37:08','2026-07-07 22:37:08'),(19,'Dave O. Payla','dave@gmail.com',NULL,'$2y$12$AIomTy0IVQReNJnF2oB4M.lIHTWxKNQfHwWqzRHB6lvNjdheRii5C',1,'job_seeker',NULL,'2026-07-08 19:30:02','2026-07-08 19:30:02'),(20,'Dave O. Payla','evad@gmail.com',NULL,'$2y$12$g84nohf1CkXy0dEtJ2UzierJjTQzoReT0zvvUdyYo.tS.96WF.l46',1,'job_seeker',NULL,'2026-07-08 19:31:24','2026-07-08 19:31:24'),(21,'Dave O. Payla','daves@gmail.com',NULL,'$2y$12$95ftd8Q33p.YXjbvt74fPOpQekIgh.iwv59FcUnPioa43Yk0E24/O',1,'Establishment',NULL,'2026-07-08 23:10:03','2026-07-08 23:10:03'),(23,'Marry Joy Payla','marry@gmail.com',NULL,'$2y$12$uLaZYr69tcJN8wz1JEEyf.s/nprUIcC5GeDBspeGijRjgeUTT.jWC',1,'job_seeker',NULL,'2026-07-09 20:25:20','2026-07-09 20:25:20'),(24,'Dennis Salado','dennis@gmail.com',NULL,'$2y$12$14A/3MwCcCReR90onW0COOKgYRblVVgOxlAkL5SFQP5ksGt6z5p0e',1,'job_seeker',NULL,'2026-07-09 22:14:56','2026-07-09 22:14:56'),(25,'Dan Rave Payla','danrave@gmail.com',NULL,'$2y$12$s4wEzACe6qU9gNfuAlgyM.6O6IodXlA8bdw7gvS.ADztHGDHQnfy6',1,'job_seeker',NULL,'2026-07-13 00:46:57','2026-07-13 00:46:57'),(26,'test','test@test.com',NULL,'$2y$12$k3Ov5BoG/8s0RBuP4YfDdOttK5HQZDNRPGSiGnraQZEjvkovRKMxO',1,'job_seeker',NULL,'2026-07-13 08:18:22','2026-07-13 08:18:22'),(27,'Kyriel Dompor','kyriel@gmail.com',NULL,'$2y$12$d1poC7yex1Z0xkFgVuXsoOMz1WLGslhDL9/nWMxtG/uagTfv6GJzC',1,'job_seeker',NULL,'2026-07-15 00:29:13','2026-07-15 00:29:13'),(28,'Susan Talara','budoy@gmail.com',NULL,'$2y$12$2F8lHbFYclfzMMXRTLzWmeQW2Dxwcz36B0qbFbwuXOOPyPipC6JTa',1,'job_seeker',NULL,'2026-07-15 03:07:59','2026-07-15 03:07:59'),(29,'Rommel','rommel@gmail.com',NULL,'$2y$12$.mCoAgGt7c6L5/i1znh5IOcY3O/J8SIdtMmGWPSqxBQ82RoI1745q',1,'job_seeker',NULL,'2026-07-15 03:35:13','2026-07-15 03:35:13'),(30,'Danny Payla','danny@gmail.com',NULL,'$2y$12$ODSXRg8tsryvDIKyI2MNsO/00CVCEzr28pzQNShcN2fJIVB6zk6Je',1,'job_seeker',NULL,'2026-07-15 21:26:58','2026-07-15 21:26:58'),(31,'Michael James Talara','jay@gmail.com',NULL,'$2y$12$6nXUX/DRJY8gsJ7ngmxg9uHRzC/3UHRM7gbQhJmutLNKJKINNx3.y',1,'Establishment',NULL,'2026-07-16 17:38:50','2026-07-16 17:38:50'),(32,'Jan Wesley Sanchez','jansanchez@gmail.com',NULL,'$2y$12$336N79D01VMsbOXYE4NeiuJrKMBZyszxp6VzsuH3UWEyjJFMHtpb6',1,'job_seeker',NULL,'2026-07-16 17:51:34','2026-07-16 17:51:34'),(33,'Agency Admin','agency@peso.com',NULL,'$2y$12$u.oz0zEmV37stdZlQbHqzeUqjT5uXjZARxm9NK5c3rZHPqxt0HXM.',1,'Agency',NULL,'2026-09-10 09:04:37','2026-09-10 09:04:37'),(34,'Michael James Talara','noe@gmail.com',NULL,'$2y$12$ING6ip9Wxc6F8ZdwfEqfcuSBecGaE/4ShP2LbDaOTHFlpDv8AvZ4.',1,'job_seeker',NULL,'2026-09-22 05:48:13','2026-09-22 19:10:32'),(38,'Appear Test Person','appeartest_1790087280@example.com',NULL,'$2y$04$pExiXZWo0cKcHL6ybLfbw.4ISD4ibFG.9Jh2mdmjIG.FS0s9mEzti',1,'job_seeker',NULL,'2026-09-22 06:28:00','2026-09-22 06:28:00'),(39,'Appear Test Person','appeartest_1790087303@example.com',NULL,'$2y$04$TVIcn6gUiHe2yggS/s9YguQNpCYQtoNJ3qNyAussztiFRcbikEmua',1,'job_seeker',NULL,'2026-09-22 06:28:23','2026-09-22 06:28:23'),(41,'Dave Payla','dave@gamil.com',NULL,'$2y$12$1EoyDvHq5PM6.TxCRY8HcOs.KvtmTaGuhdvx2V0/QYyEDqlI70CDi',1,'job_seeker',NULL,'2026-09-22 06:44:51','2026-09-22 06:44:51'),(43,'Angel Ladera','angel@gmail.com',NULL,'$2y$12$c0hVl0cWO/NGoUsmGcQy0Oe9JouLK8kzKg0qv23T0s5gBRkJquHgO',1,'Establishment',NULL,'2026-09-26 05:03:46','2026-09-26 05:03:46'),(44,'Angelo Enerio','angelo@gmail.com',NULL,'$2y$12$0RRS0WOlEG/MWQK7AJqk.uI8Ld0bOYLiuqE.TmtsS18TZhUYiG5kG',1,'Establishment',NULL,'2026-09-27 04:54:57','2026-09-27 04:54:57'),(45,'Angelo Enerio','tinay@gmail.com',NULL,'$2y$12$Odg5LAe35VXg300w/uj8.umhgOlVVX2KiaM6KZ15LVCYSQK6vyFYq',1,'job_seeker',NULL,'2026-09-27 05:10:32','2026-09-27 05:10:32'),(49,'Michael\'s Corporated','occ.talara.michaeljames@gmail.com',NULL,'$2y$12$o4/4cE1Ruqoh5rii/wXk/eF30XacZGgu8ahf8rGyJ8m/H84KveFCO',1,'Agency',NULL,'2026-09-27 06:44:24','2026-09-27 06:44:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-29 20:58:34
