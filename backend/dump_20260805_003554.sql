-- TODO: rodei esse dump depois de migrar para o PC em 05/08
-- TODO: comando: docker exec -i rtcmobile-db mysql -u root -proot rtcmobile < dump_20260805_003554.sql 

-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: rtcmobile
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0b137a3d-9401-4eaf-85c5-6cb34391321a','1dc4507dc28e635766851332136076cd2b879e9e8789cbce0ed1774b695bc446','2026-05-23 05:05:47.252','20260523050121_fix_tables',NULL,NULL,'2026-05-23 05:05:46.262',1),('0b6b17ff-1cf4-4a03-b775-df859ec861cb','7857cae4b5bfd1c1275c2aca4eecebc8090cec7fce95be32c887d082293454c0','2026-05-23 05:05:43.106','20260516012024_create_routes',NULL,NULL,'2026-05-23 05:05:43.026',1),('0e7460cf-3b9d-4b63-96aa-bcec78aafec6','28126ead207a511142050a28a948c7d5f389c540341fa7032fb7ae8503367cf5','2026-06-02 00:25:47.876','20260602002547_add_route_anchor_points',NULL,NULL,'2026-06-02 00:25:47.433',1),('1acf7e84-95f0-469f-83cb-b4e1b7f713f9','8af48cec5e060e58660a27ce48ad673c1421886efc14e596fd2bc0d2c73fb7f9','2026-05-23 05:05:46.065','20260522011555_add_about_to_cities',NULL,NULL,'2026-05-23 05:05:45.925',1),('20f8566a-4797-44bf-b8d8-bde03be79930','426df5759e6058c9ff628917d27f37da49dc3a9d63703309d2b0f82e56c1c47c','2026-05-23 05:05:43.741','20260516013330_create_city_routes',NULL,NULL,'2026-05-23 05:05:43.301',1),('255baf92-0bc1-475b-85be-670a94775912','457fa150165164396ca25c22785ce72ac50d6342404f7c9aa860cdff2c57ea46','2026-05-23 05:05:45.528','20260516013739_create_user_stamps',NULL,NULL,'2026-05-23 05:05:44.878',1),('42d3b18b-f803-4c8c-aa11-914f5463fbc9','4123961adfd1d3b62ac6c6292938310d1a8aafbf046d73124ec30e8e38f3281e','2026-05-23 05:05:43.192','20260516012847_create_cities',NULL,NULL,'2026-05-23 05:05:43.114',1),('472e3fe8-f4b5-41ca-b82b-b7f21b2d65e6','26737a698436b31e153368ddc033f477fee3bd5c20c76dd432bf6408ab8a4289','2026-05-23 05:05:43.292','20260516012929_create_cities',NULL,NULL,'2026-05-23 05:05:43.201',1),('4ec6837a-c081-4e2b-b7b8-6bdac7caa090','cbaf7bf4152c82a3a5a7d3b05f8a18961f57605fa5c0a3b1c7f546c406275ebd','2026-05-23 05:05:44.869','20260516013637_create_activity_waypoints',NULL,NULL,'2026-05-23 05:05:44.622',1),('6c93c4a8-4c99-450a-b21a-b21497322062','79d9e8d4d9e3daaafed00dd009c1fc3e86aef1dbf976b64279910721e66ec187','2026-06-07 18:30:34.326','20260607183033_add_city_images',NULL,NULL,'2026-06-07 18:30:33.829',1),('7049a252-c6dc-40f4-8b88-d791d4f41712','a9799456a49403e401da0da1b55dd245020a48d80cc06a35482bae3a7cd781ed','2026-05-23 05:06:37.175','20260523050636_init',NULL,NULL,'2026-05-23 05:06:36.991',1),('8a87499f-82e4-4a1f-8d94-3aa34d87ddb7','fcf691bb1ffc9dac6203b62acd77482a8d16485f630222482d277aeda140c657','2026-05-23 05:05:44.168','20260516013457_create_city_anchorpoints',NULL,NULL,'2026-05-23 05:05:43.752',1),('922718ea-81bc-495e-b48e-da9875637375','2d1e379a9644a6c9bbcc3523a50e90980fd599cfab24e305eb4810a924127e18','2026-05-30 14:21:51.933','20260530142151_add_date_fields_to_route_segment',NULL,NULL,'2026-05-30 14:21:51.761',1),('af70d2a3-0f84-4781-aa02-17829f1b1ac2','85f80ffaaa745e5cca63bfdee31f100f5b9257f936d496ae6b95e4018b52fb03','2026-05-23 05:05:44.613','20260516013547_create_activities',NULL,NULL,'2026-05-23 05:05:44.179',1),('c550bb70-e920-447b-a713-67846e39afce','988969f06df86ff7617286e70e1903d00c9775f1993bdc85d9652b12fa3837b8','2026-06-01 23:57:37.549','20260601235737_alter_city_about_to_text',NULL,NULL,'2026-06-01 23:57:37.348',1),('cfcac748-cfdf-4fda-b0c6-0ab513ac1b38','5858095bcc8583f83e93c02cad78e662387d6b3809d77b78c29f8ed8907bbbc3','2026-05-23 05:05:46.252','20260522034753_change_lat_lng_type',NULL,NULL,'2026-05-23 05:05:46.074',1),('d1c64969-f9d9-415b-9914-7899f9e88998','c4cf6406ae0a1ac1cb77222253f469dc41a963da0a114241d24e543d6742022b','2026-05-23 05:05:45.915','20260519164108_add_anchor_point_category',NULL,NULL,'2026-05-23 05:05:45.537',1),('dce795dc-cab5-45fb-9edf-a27a23a6acaa','59567ea26a05edf27328001ee726b6b46d749381a0bfe21e7052ca983cebae38','2026-05-30 14:15:22.785','20260530141522_add_route_segments',NULL,NULL,'2026-05-30 14:15:22.122',1),('fbec3f30-2679-4985-93bd-1ccea88b254b','ba6497b0a6684b9239f488cfc7ad600c920e2b3a380d74c080bc887fc16b8fc3','2026-05-23 05:05:43.016','20260424012552_init_users',NULL,NULL,'2026-05-23 05:05:42.899',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_distance` double NOT NULL,
  `start_time` datetime(3) NOT NULL,
  `end_time` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_user_id_fkey` (`user_id`),
  KEY `activities_route_id_fkey` (`route_id`),
  CONSTRAINT `activities_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_waypoints`
--

DROP TABLE IF EXISTS `activity_waypoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_waypoints` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `timestamp` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_waypoints_activity_id_fkey` (`activity_id`),
  CONSTRAINT `activity_waypoints_activity_id_fkey` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_waypoints`
--

LOCK TABLES `activity_waypoints` WRITE;
/*!40000 ALTER TABLE `activity_waypoints` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_waypoints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anchor_point_categories`
--

DROP TABLE IF EXISTS `anchor_point_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anchor_point_categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anchor_point_categories`
--

LOCK TABLES `anchor_point_categories` WRITE;
/*!40000 ALTER TABLE `anchor_point_categories` DISABLE KEYS */;
INSERT INTO `anchor_point_categories` VALUES ('2bd77206-9c6c-4928-85de-21d5337905b2','Turismo','tourism','tourism.svg',1,'2026-06-02 01:41:14.138','2026-06-02 01:41:14.138',NULL),('3032a631-043e-4c96-bf5d-8bddf3bfc979','Hotel','hotel','hotel.svg',1,'2026-06-02 00:19:47.433','2026-06-02 00:19:47.433',NULL),('33835ee6-b9d6-4ce0-a254-c550c622ca93','Farmácias','pharmacy','pharmacy.svg',1,'2026-05-26 02:42:48.027','2026-05-26 02:42:48.027',NULL),('4d353b44-deba-4b6f-9b68-d03a75769c0f','Lojas, Mercados e Supermercados','store','store.svg',1,'2026-06-02 00:19:11.606','2026-06-02 00:19:11.606',NULL),('6caf1e0f-489a-4214-b838-6c71a0600afd','Posto de Gasolina','gas_station','gas_station.svg',1,'2026-06-02 00:19:31.540','2026-06-02 00:19:31.540',NULL),('a2432a27-15db-4dfe-bed1-0941bbc09dcf','Depósito de Bebidas','beverage_storage','beverage_storage.svg',1,'2026-06-02 00:20:07.699','2026-06-02 00:20:07.699',NULL),('b1069b00-5905-4163-918f-125329f990a3','Hospital','hospital','hospital.svg',1,'2026-06-02 00:18:46.232','2026-06-02 00:18:46.232',NULL),('b3e20f43-01a8-4158-92a2-0f5c3da7ca69','Alimentação','food','food.svg',1,'2026-05-26 01:42:53.838','2026-05-26 01:42:53.838',NULL),('c075a81e-ee85-47c4-aa5c-d71e49fc0cdf','Reparo','repair','repair.svg',1,'2026-06-02 00:18:28.957','2026-06-02 00:18:28.957',NULL);
/*!40000 ALTER TABLE `anchor_point_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anchor_point_images`
--

DROP TABLE IF EXISTS `anchor_point_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anchor_point_images` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anchor_point_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `anchor_point_images_anchor_point_id_fkey` (`anchor_point_id`),
  CONSTRAINT `anchor_point_images_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anchor_point_images`
--

LOCK TABLES `anchor_point_images` WRITE;
/*!40000 ALTER TABLE `anchor_point_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `anchor_point_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anchor_points`
--

DROP TABLE IF EXISTS `anchor_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anchor_points` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `business_hours` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `anchor_points_category_id_fkey` (`category_id`),
  CONSTRAINT `anchor_points_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `anchor_point_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anchor_points`
--

LOCK TABLES `anchor_points` WRITE;
/*!40000 ALTER TABLE `anchor_points` DISABLE KEYS */;
INSERT INTO `anchor_points` VALUES ('2f93666e-aacc-4821-9ba6-8faf5dcbd264','Hotel Blanner',-29.954837,-51.625074,'08:00 - 00:00','(51) 3658-7773',NULL,1,'2026-06-02 00:58:23.038','2026-06-02 00:58:23.038',NULL,'3032a631-043e-4c96-bf5d-8bddf3bfc979'),('32a18086-409c-4cc1-8b9e-2538bebde7c2','Xiskão Lanches',-29.959389,-51.624082,'18:30 - 23:00','(51) 93658-1532',NULL,1,'2026-05-26 01:58:02.045','2026-05-26 01:58:02.045',NULL,'b3e20f43-01a8-4158-92a2-0f5c3da7ca69'),('3552ceaa-37a9-45a2-8d8c-ff24fa7aa19e','Memorial do Mineiro',-29.96202457563631,-51.62110548302313,'Indisponível','Indisponível',NULL,1,'2026-06-02 01:41:29.998','2026-06-02 01:41:29.998',NULL,'2bd77206-9c6c-4928-85de-21d5337905b2'),('3982546b-ba13-4feb-b01e-0b41a5ba60cc','Farmácias Agafarma',-29.960334,-51.623684,'8:00 - 20:00','(51) 98595-3976',NULL,1,'2026-05-26 02:43:08.747','2026-05-26 02:43:08.747',NULL,'33835ee6-b9d6-4ce0-a254-c550c622ca93'),('7adc003f-c429-4fd1-8146-7d2f1e565766','Gastão Borracharia',-29.967049752360868,-51.627652271450735,'08:00 - 20:00','Indisponível',NULL,1,'2026-06-02 01:20:30.102','2026-06-02 01:20:30.102',NULL,'c075a81e-ee85-47c4-aa5c-d71e49fc0cdf'),('84ef06a6-19df-4916-a75d-b1db605534c0','Duzeca Pizzaria',-29.96128330383818,-51.62217257417733,'19:00 - 23:00','(51) 3080-2121',NULL,1,'2026-06-02 01:14:36.734','2026-06-02 01:14:36.734',NULL,'b3e20f43-01a8-4158-92a2-0f5c3da7ca69'),('8e9b2864-7c63-4047-a894-71a6660c9207','Pneumax',-29.967869427975344,-51.62898675547577,'07:30 - 18:30','(51) 3658-6272',NULL,1,'2026-06-02 01:26:05.948','2026-06-02 01:26:05.948',NULL,'4d353b44-deba-4b6f-9b68-d03a75769c0f'),('a2f4dad9-a7b9-4ba1-adf7-d7069fd0901e','Desco Atacado',-29.9681026904487,-51.62826492202498,'08:00 - 21:00','(51) 3658-3538',NULL,1,'2026-06-02 01:22:52.403','2026-06-02 01:22:52.403',NULL,'4d353b44-deba-4b6f-9b68-d03a75769c0f'),('c31e786d-c1a1-47e7-bbe7-4b3ece53e2b7','BG Hotel e Restaurante',-29.957687,-51.627738,'11:00 - 15:00','(51) 3658-1720',NULL,1,'2026-06-02 00:55:57.582','2026-06-02 00:55:57.582',NULL,'3032a631-043e-4c96-bf5d-8bddf3bfc979'),('c62691f3-987a-4944-a2c3-1e32085814aa','Supermercado Índio',-29.960059,-51.624138,'07:00 - 22:00','(51) 3658-2992',NULL,1,'2026-06-02 01:03:31.855','2026-06-02 01:04:32.388',NULL,'4d353b44-deba-4b6f-9b68-d03a75769c0f'),('cdf5b29d-7176-4a65-8f66-df0f27e1c64b','Frubel o Ponto do Confeiteteiro',-29.958839,-51.623924,'09:00 - 18:30','(51) 99662-9059',NULL,1,'2026-06-02 01:01:07.124','2026-06-02 01:01:07.124',NULL,'b3e20f43-01a8-4158-92a2-0f5c3da7ca69'),('e00a9856-05c2-485d-b058-f9df4543e601','Padaria Yung',-29.970842855373274,-51.6289614257183,'07:00 - 20:00','(51) 99620-8618',NULL,1,'2026-06-02 01:28:35.553','2026-06-02 01:28:35.553',NULL,'b3e20f43-01a8-4158-92a2-0f5c3da7ca69'),('f64a6212-53dc-4059-8c18-dd4382d4563e','iChicken Box',-29.96092630846711,-51.62334804505521,'18:30 - 00:00','(51) 99929-6482',NULL,1,'2026-06-02 01:07:54.054','2026-06-02 01:10:05.131',NULL,'b3e20f43-01a8-4158-92a2-0f5c3da7ca69');
/*!40000 ALTER TABLE `anchor_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `zoom` int NOT NULL,
  `banner_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `about` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES ('0d546942-f0a3-4c37-b9a2-563047af308b','Butiá',-30.1193,-51.9627,12,NULL,1,1,'2026-05-23 05:09:43.014','2026-05-23 05:09:43.014',NULL,''),('1ae4a0c9-13b6-456a-b613-27ac64a290fb','Santo Amaro do Sul',-29.93846759307917,-51.897529211737364,12,NULL,1,1,'2026-06-05 03:38:15.234','2026-06-05 03:38:15.234',NULL,''),('21c547bf-90eb-4db9-a57f-00ea07cc3612','São Jerônimo',-29.95,-51.73,12,NULL,1,1,'2026-05-23 05:10:48.586','2026-05-23 05:10:48.586',NULL,''),('31b21b62-8425-43ab-b6ac-c5ed1d064c0e','Barão do Triunfo',-30.38899,-51.73885,12,NULL,1,1,'2026-05-23 05:09:21.887','2026-05-23 05:09:21.887',NULL,''),('41c8c2c8-4095-496a-bdd5-d40a3e2c55e0','General Câmara',-29.939016,-51.897958,12,NULL,1,1,'2026-05-23 05:10:04.161','2026-05-23 05:10:04.161',NULL,''),('80ca6c2e-5fee-4ea7-b8d2-51b5bbfb0045','Vale Verde',-29.783418,-52.185245,12,NULL,1,1,'2026-05-23 05:08:30.355','2026-05-23 05:08:30.355',NULL,''),('bc921ac6-c450-46a9-8606-a5492383768c','Charqueadas',-29.95,-51.64,12,NULL,1,1,'2026-05-23 05:07:15.562','2026-06-01 23:57:53.854',NULL,'A origem de Charqueadas está ligada ao charque (carne bovina seca e salgada). Os tropeiros conduziam o gado até a foz do Arroio dos Ratos, afluente do Rio Jacuí. Ali, o gado era abatido e a carne, transformada em charque nas chamadas charqueadas. Esse produto era depois transportado pelo Rio Jacuí até Porto Alegre e para outros centros do país e do exterior. Com o surgimento de novas tecnologias de conservação, como geladeiras, frigoríficos e embutidos, as charqueadas perderam força como atividade econômica. A localidade, então, passou a buscar novas alternativas. Um novo ciclo econômico iniciou-se com a perfuração do primeiro poço para a extração de carvão mineral, na década de 1950; o poço Octávio Reis era o mais profundo do país. A partir da extração de carvão, desenvolveu-se com mais intensidade o povoamento e surgiram as principais empresas da localidade, cada uma representando um segmento: Copelmi (mineradora extrativista), Eletrosul (usina termelétrica) e Aços Finos Piratini, que deu origem ao ciclo da siderurgia e à implantação do polo metal-mecânico.'),('e4a2a101-28da-4c2d-81c8-25dca8f54d31','Arroio dos Ratos',-30.09,-51.75,12,NULL,1,1,'2026-05-23 05:08:57.658','2026-05-23 05:08:57.658',NULL,''),('e52bd770-6cc7-4c1f-b17d-2fcde47a4276','Minas do Leão',-30.1459,-52.0551,12,NULL,1,1,'2026-05-23 05:10:28.709','2026-05-23 05:10:28.709',NULL,''),('f8916eb9-c134-431e-b970-e8ac2ea195e5','Triunfo',-29.9429,-51.7185,12,NULL,1,1,'2026-05-23 05:11:09.820','2026-05-23 05:11:09.820',NULL,'');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city_anchorpoints`
--

DROP TABLE IF EXISTS `city_anchorpoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city_anchorpoints` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anchor_point_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `city_anchorpoints_city_id_fkey` (`city_id`),
  KEY `city_anchorpoints_anchor_point_id_fkey` (`anchor_point_id`),
  CONSTRAINT `city_anchorpoints_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `city_anchorpoints_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city_anchorpoints`
--

LOCK TABLES `city_anchorpoints` WRITE;
/*!40000 ALTER TABLE `city_anchorpoints` DISABLE KEYS */;
INSERT INTO `city_anchorpoints` VALUES ('07042654-1cb6-45fa-a7b5-140c77bb86ee','bc921ac6-c450-46a9-8606-a5492383768c','3552ceaa-37a9-45a2-8d8c-ff24fa7aa19e','2026-06-02 01:41:30.003','2026-06-02 01:41:30.003',NULL),('14a910b7-21c3-4dfb-9db4-9cea7496ad3b','bc921ac6-c450-46a9-8606-a5492383768c','32a18086-409c-4cc1-8b9e-2538bebde7c2','2026-05-26 01:58:02.055','2026-05-26 01:58:02.055',NULL),('1bdec22e-78ce-4dfc-9a0c-9d93dda7acac','bc921ac6-c450-46a9-8606-a5492383768c','f64a6212-53dc-4059-8c18-dd4382d4563e','2026-06-02 01:07:54.058','2026-06-02 01:07:54.058',NULL),('1efdcbf0-ebb3-4f29-8c67-30e0f35138ca','bc921ac6-c450-46a9-8606-a5492383768c','c31e786d-c1a1-47e7-bbe7-4b3ece53e2b7','2026-06-02 00:55:57.595','2026-06-02 00:55:57.595',NULL),('4b9616cd-71dc-4129-8e84-7640925736a0','bc921ac6-c450-46a9-8606-a5492383768c','84ef06a6-19df-4916-a75d-b1db605534c0','2026-06-02 01:14:36.743','2026-06-02 01:14:36.743',NULL),('64bd1f9a-ed38-4d9c-ad45-162612d5d6e6','bc921ac6-c450-46a9-8606-a5492383768c','a2f4dad9-a7b9-4ba1-adf7-d7069fd0901e','2026-06-02 01:22:52.407','2026-06-02 01:22:52.407',NULL),('68c94931-3f03-4c58-9805-4eefbf1d7b9b','bc921ac6-c450-46a9-8606-a5492383768c','8e9b2864-7c63-4047-a894-71a6660c9207','2026-06-02 01:26:05.956','2026-06-02 01:26:05.956',NULL),('71b3e1f6-44ac-40a9-9c71-ee3db5e09f31','bc921ac6-c450-46a9-8606-a5492383768c','e00a9856-05c2-485d-b058-f9df4543e601','2026-06-02 01:28:35.558','2026-06-02 01:28:35.558',NULL),('900dcbf9-8a16-4eb1-9d51-c70fe1c15ee4','bc921ac6-c450-46a9-8606-a5492383768c','3982546b-ba13-4feb-b01e-0b41a5ba60cc','2026-05-26 02:43:08.760','2026-05-26 02:43:08.760',NULL),('bfaca74d-7f2b-4c8d-900d-a9bbff3c5be9','bc921ac6-c450-46a9-8606-a5492383768c','2f93666e-aacc-4821-9ba6-8faf5dcbd264','2026-06-02 00:58:23.041','2026-06-02 00:58:23.041',NULL),('e2e7cdc6-77f8-4017-a04f-3c7c43c0e052','bc921ac6-c450-46a9-8606-a5492383768c','7adc003f-c429-4fd1-8146-7d2f1e565766','2026-06-02 01:20:30.106','2026-06-02 01:20:30.106',NULL),('f7290096-0a2c-44c9-8508-fa115e1708ac','bc921ac6-c450-46a9-8606-a5492383768c','c62691f3-987a-4944-a2c3-1e32085814aa','2026-06-02 01:03:31.859','2026-06-02 01:03:31.859',NULL),('faff545b-bafe-4dd4-8b45-82af29e214c1','bc921ac6-c450-46a9-8606-a5492383768c','cdf5b29d-7176-4a65-8f66-df0f27e1c64b','2026-06-02 01:01:07.126','2026-06-02 01:01:07.126',NULL);
/*!40000 ALTER TABLE `city_anchorpoints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city_images`
--

DROP TABLE IF EXISTS `city_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city_images` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `city_images_city_id_fkey` (`city_id`),
  CONSTRAINT `city_images_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city_images`
--

LOCK TABLES `city_images` WRITE;
/*!40000 ALTER TABLE `city_images` DISABLE KEYS */;
INSERT INTO `city_images` VALUES ('0659ad29-4952-4283-900a-9dc0a3312751','bc921ac6-c450-46a9-8606-a5492383768c','https://res.cloudinary.com/dryh3jix7/image/upload/v1780860968/rota-cric/cities/bc921ac6-c450-46a9-8606-a5492383768c/vmqgxcjvphyzlosesgv4.jpg','Paróquia Nossa Senhora dos Navegantes',1,1,'2026-06-07 19:36:09.294','2026-06-07 19:36:09.294',NULL),('afb608e2-c48b-455f-b8e0-8f02691855dc','bc921ac6-c450-46a9-8606-a5492383768c','https://res.cloudinary.com/dryh3jix7/image/upload/v1780859978/rota-cric/cities/bc921ac6-c450-46a9-8606-a5492383768c/wlz1ly73ll2j7ceupy6n.jpg','Letreiro da entrada de Charqueadas',0,1,'2026-06-07 19:19:39.489','2026-06-07 19:19:39.489',NULL),('b105185b-1649-405c-8158-a84d0ee30436','bc921ac6-c450-46a9-8606-a5492383768c','https://res.cloudinary.com/dryh3jix7/image/upload/v1780861201/rota-cric/cities/bc921ac6-c450-46a9-8606-a5492383768c/ylf3jbhyuqrneozeji8r.jpg','Imagem aérea do centro de Charqueadas ',2,1,'2026-06-07 19:40:02.211','2026-06-07 19:40:02.211',NULL);
/*!40000 ALTER TABLE `city_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city_routes`
--

DROP TABLE IF EXISTS `city_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city_routes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `city_routes_city_id_fkey` (`city_id`),
  KEY `city_routes_route_id_fkey` (`route_id`),
  CONSTRAINT `city_routes_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `city_routes_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city_routes`
--

LOCK TABLES `city_routes` WRITE;
/*!40000 ALTER TABLE `city_routes` DISABLE KEYS */;
/*!40000 ALTER TABLE `city_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_anchor_points`
--

DROP TABLE IF EXISTS `route_anchor_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_anchor_points` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anchor_point_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `on_route` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `route_anchor_points_route_id_fkey` (`route_id`),
  KEY `route_anchor_points_anchor_point_id_fkey` (`anchor_point_id`),
  CONSTRAINT `route_anchor_points_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `route_anchor_points_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_anchor_points`
--

LOCK TABLES `route_anchor_points` WRITE;
/*!40000 ALTER TABLE `route_anchor_points` DISABLE KEYS */;
INSERT INTO `route_anchor_points` VALUES ('0bcf5ae0-5fe3-465b-a070-55c246e75c5c','c852eb3a-e732-4c65-ad83-d444fda55c07','7adc003f-c429-4fd1-8146-7d2f1e565766',1,'2026-06-02 01:20:45.506','2026-06-02 01:20:45.506',NULL),('12218f9d-c2da-473e-94a2-5acb31a2c0f6','70a71278-523e-4657-8216-727f4af68675','2f93666e-aacc-4821-9ba6-8faf5dcbd264',1,'2026-06-02 00:58:42.849','2026-06-02 00:58:42.849',NULL),('1bc02425-d76f-4fca-aab4-f8711928863b','c852eb3a-e732-4c65-ad83-d444fda55c07','e00a9856-05c2-485d-b058-f9df4543e601',1,'2026-06-02 01:28:47.491','2026-06-02 01:28:47.491',NULL),('36e08d9a-82ce-4646-9b56-21216a675ab2','70a71278-523e-4657-8216-727f4af68675','f64a6212-53dc-4059-8c18-dd4382d4563e',1,'2026-06-02 01:08:17.321','2026-06-02 01:08:17.321',NULL),('47d28823-586e-45b2-a42d-20b8943e622a','70a71278-523e-4657-8216-727f4af68675','c62691f3-987a-4944-a2c3-1e32085814aa',1,'2026-06-02 01:04:59.462','2026-06-02 01:04:59.462',NULL),('57fb774a-8cd4-4bef-a5de-a2f24e8bd5fc','70a71278-523e-4657-8216-727f4af68675','84ef06a6-19df-4916-a75d-b1db605534c0',1,'2026-06-02 01:14:50.744','2026-06-02 01:14:50.744',NULL),('67626921-3827-4281-9a08-ec2f477840f5','c852eb3a-e732-4c65-ad83-d444fda55c07','8e9b2864-7c63-4047-a894-71a6660c9207',0,'2026-06-02 01:26:20.742','2026-06-02 01:26:20.742',NULL),('72411643-36c3-43cb-bca3-4f0c0a326d87','c852eb3a-e732-4c65-ad83-d444fda55c07','a2f4dad9-a7b9-4ba1-adf7-d7069fd0901e',1,'2026-06-02 01:23:43.464','2026-06-02 01:23:43.464',NULL),('8f69b692-4655-4a2a-91d6-5ad039f8bbbf','70a71278-523e-4657-8216-727f4af68675','cdf5b29d-7176-4a65-8f66-df0f27e1c64b',1,'2026-06-02 01:01:24.724','2026-06-02 01:01:24.724',NULL),('926735d0-50b2-47f0-b754-fca0a3247cfb','70a71278-523e-4657-8216-727f4af68675','32a18086-409c-4cc1-8b9e-2538bebde7c2',1,'2026-06-02 23:38:35.489','2026-06-02 23:38:35.489',NULL),('99ecefc6-a1a9-4722-bb1f-bf8d937b0110','70a71278-523e-4657-8216-727f4af68675','c31e786d-c1a1-47e7-bbe7-4b3ece53e2b7',1,'2026-06-02 00:56:11.089','2026-06-02 00:56:11.089',NULL),('b7411b40-e71c-4983-b0f7-d24c1a4b1142','70a71278-523e-4657-8216-727f4af68675','3552ceaa-37a9-45a2-8d8c-ff24fa7aa19e',0,'2026-06-02 01:43:51.225','2026-06-02 01:43:51.225',NULL),('fdadd221-d42e-4690-9f1b-d3f76bc494dd','70a71278-523e-4657-8216-727f4af68675','3982546b-ba13-4feb-b01e-0b41a5ba60cc',1,'2026-06-02 23:38:53.705','2026-06-02 23:38:53.705',NULL);
/*!40000 ALTER TABLE `route_anchor_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_segments`
--

DROP TABLE IF EXISTS `route_segments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_segments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_city_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_city_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `route_segments_route_id_fkey` (`route_id`),
  KEY `route_segments_from_city_id_fkey` (`from_city_id`),
  KEY `route_segments_to_city_id_fkey` (`to_city_id`),
  CONSTRAINT `route_segments_from_city_id_fkey` FOREIGN KEY (`from_city_id`) REFERENCES `cities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `route_segments_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `route_segments_to_city_id_fkey` FOREIGN KEY (`to_city_id`) REFERENCES `cities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_segments`
--

LOCK TABLES `route_segments` WRITE;
/*!40000 ALTER TABLE `route_segments` DISABLE KEYS */;
INSERT INTO `route_segments` VALUES ('0091963c-26de-47e8-9848-5e90a8fc7333','f8bf549f-7425-45ed-adac-065c0a482a46','e4a2a101-28da-4c2d-81c8-25dca8f54d31','0d546942-f0a3-4c37-b9a2-563047af308b',37.27,'2026-06-05 03:46:29.104',NULL,'2026-06-05 03:46:29.104'),('0351f3d8-2fa7-4da2-be6f-d445ff2c2035','4d2e85ca-b713-4db9-ab58-ff0e295bd0c8','1ae4a0c9-13b6-456a-b613-27ac64a290fb','41c8c2c8-4095-496a-bdd5-d40a3e2c55e0',16.53,'2026-06-05 03:39:18.275',NULL,'2026-06-05 03:39:18.275'),('09823db8-e0ac-4fa6-bb7c-d94c480a9e59','107cd97d-b307-4e8b-abab-83bb1d6ad15b','e4a2a101-28da-4c2d-81c8-25dca8f54d31','31b21b62-8425-43ab-b6ac-c5ed1d064c0e',46.59,'2026-06-05 03:35:25.592',NULL,'2026-06-05 03:35:25.592'),('2881f2ca-e506-4bc7-b05e-2f23b79e606d','e0aaf285-7c8a-4ebd-bf45-185e77e33c6a','0d546942-f0a3-4c37-b9a2-563047af308b','21c547bf-90eb-4db9-a57f-00ea07cc3612',33.64,'2026-06-05 03:44:47.602',NULL,'2026-06-05 03:44:47.602'),('4c93ce3d-5a93-479d-9a83-ca71a3463bdc','2b545520-16a7-4147-a99b-2da37c358b0e','0d546942-f0a3-4c37-b9a2-563047af308b','e52bd770-6cc7-4c1f-b17d-2fcde47a4276',11.24,'2026-06-05 03:36:11.429',NULL,'2026-06-05 03:36:11.429'),('5a9b5d69-4c1c-4000-843a-6d879687b088','8f2a0f7a-1e53-43de-83a5-93a392d3c503','21c547bf-90eb-4db9-a57f-00ea07cc3612','e4a2a101-28da-4c2d-81c8-25dca8f54d31',15.52,'2026-05-30 15:57:47.793',NULL,'2026-05-30 15:57:47.793'),('94d83416-c7b6-459c-a699-7140c304d77e','70a71278-523e-4657-8216-727f4af68675','bc921ac6-c450-46a9-8606-a5492383768c','21c547bf-90eb-4db9-a57f-00ea07cc3612',12.14,'2026-05-30 15:37:09.806',NULL,'2026-05-30 15:37:09.806'),('a7ce9925-b885-4cb8-9db5-b149aa269e89','032c332e-57ea-4757-babd-cb0d63a79821','21c547bf-90eb-4db9-a57f-00ea07cc3612','41c8c2c8-4095-496a-bdd5-d40a3e2c55e0',11.76,'2026-05-30 15:56:31.855',NULL,'2026-05-30 15:56:31.855'),('b8026c66-636b-4058-8e3e-6d8347b95fe7','94d9753c-c1ea-456a-9622-ca1a9ca09bc0','41c8c2c8-4095-496a-bdd5-d40a3e2c55e0','f8916eb9-c134-431e-b970-e8ac2ea195e5',19.68,'2026-06-05 03:42:52.049',NULL,'2026-06-05 03:42:52.049'),('c1687c96-2fa3-4388-9cf5-579c89218409','f082034b-b417-47cb-8103-4b4f0eaed941','f8916eb9-c134-431e-b970-e8ac2ea195e5','21c547bf-90eb-4db9-a57f-00ea07cc3612',5.08,'2026-06-05 03:45:51.649',NULL,'2026-06-05 03:45:51.649'),('c2d0f007-ce89-4058-aa1f-e5d9a8a26ec3','c852eb3a-e732-4c65-ad83-d444fda55c07','bc921ac6-c450-46a9-8606-a5492383768c','e4a2a101-28da-4c2d-81c8-25dca8f54d31',25.24,'2026-05-30 15:43:54.174',NULL,'2026-05-30 15:43:54.174'),('cf33a824-51b3-4237-8559-7ace41b4ea52','b8d17c80-0e56-49d7-8f9d-5ebbf9693fbe','1ae4a0c9-13b6-456a-b613-27ac64a290fb','80ca6c2e-5fee-4ea7-b8d2-51b5bbfb0045',39.65,'2026-06-05 03:43:40.247',NULL,'2026-06-05 03:43:40.247'),('ef6f63e8-5ed1-4655-82a9-a0440f69be76','600f0dd6-3ffc-4f16-826a-7cae7819d5fc','31b21b62-8425-43ab-b6ac-c5ed1d064c0e','e4a2a101-28da-4c2d-81c8-25dca8f54d31',43.44,'2026-06-05 03:40:47.819',NULL,'2026-06-05 03:40:47.819');
/*!40000 ALTER TABLE `route_segments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `polyline` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `strava_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distance` double NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES ('032c332e-57ea-4757-babd-cb0d63a79821','São Jerônimo -> General Câmara','|ozuDrnuzHjTn@vN^jEPxBTxAXfCt@bD|A`NfIZ`AEtBoEzWw@vC_AvB}CtISnAQdC?jA@x@fA~GBnBA|@uCv^cCj\\iAdIcTxeAc@pAeAlCiA|Ao@p@eBfA?A{@Z}@TaCTcACaBKaB[s[aIeTgHiDaAyD_AuCUyA?mBBy@HaEr@_Ct@iCtAyAbAgDbDoCrBsA~@iA\\aDp@sBj@eClAaDhBiCfBy@^kDnAuAXsCb@gGnAsBf@i@RqCrAwAx@iGxF}EzEcCxAqDnAuEt@mDx@iDTk@?sDYaEm@gA]eAUgC_@oBc@iGk@}B[_Ec@aAOaI{@yCk@cC[iDUoIkAgDYoDk@uFq@_A[c@a@_@_B]eIAkBkBmJ_','3007668506003092348','#273273',11.76,1,'2026-05-23 05:22:30.891','2026-05-23 05:22:30.891',NULL),('107cd97d-b307-4e8b-abab-83bb1d6ad15b','Arroio dos Ratos -> Barão do Triunfo','xyvvD|yuzH?PBoBNgBlBg{@PkDN_JVyG?wC^F`VfAnBI`MsBlEo@nAEjBBlOfAVDl@TbVfM~BbAjKlDt@f@fMnP\\f@x@lFfA`GxC`SXvAzBpFtBtHp@|Ax@x@b@XrFbAR[b@sC`@a@v@I~@BrFu@jARfABnBWv@a@tMoJrKyGhLuHrGqE`FcDvC_Bx@y@p@c@vCcFl@y@vHoAdGaBfGkBvGaCty@a^v@KvJjAhAFtLLhAMzCaA|FyBrC}@nEWzAVvI`IxHjFxN~GpPrI|HxGdBf@j^bFv@HpAdAr@t@t@tAlAbA|@X|DLjCNtBl@~ErBjErBnB^lBXnAGz@Q`@c@b@kAfAcGBsAOgAmAuGUsCq@oBS}@E}ADc@b@u@vCeEB]?}AJ[v@UhKPzAH~Ab@lAn@zFvE|BxA~B`AnWfFdCR|DI`Hb@zFnA~DbAxAP|c@`AlVlEhA^pPxHnKrGhAf@`JxBjAb@nElCt@RtGe@`Cy@nDeBr@cATaBPiBfCmFdAcAv@YxPy@fKaElAUvABdGfBjAx@fNpLjAt@xAb@`BXjHx@nFx@jC~@xNvDp@MrYaHtAQdJBpZgAfFsAhC[pBM~KQ~B]|@u@d@gAlBaJj@yAxG{KjEeNhDqNdLmLlAwBjAsDfAsD`AaChDsFpA}A|@w@hACv@HlEXjEH`Ec@zLk@xCmA`@g@Bk@?q@SeC?kARq@b@}@tCyEnKgJ~TmEfCwAV[fB?z@Yz@i@xBsBx@eDtB_Cp@Mh@FvB~@v@J`AGv@QpBiCjAcAt@[pBk@h@Uf@c@^k@b@yA@k@Gu@}@uTAgB`@wBf@}@hAyAbAu@Du@R_AlBqCDWAYEY@wDCg@DW`CsAR_@B}@e@sKSoA?c@Na@tBuAb@cARaAvA}CRYhByA`AwDbDaH?oABQRQdAUVMvAsBh@_@|Aq@p@MzAo@l@GfAJb@?fDkAv@k@dCiC`@_BjCiIv@_@bC}@b@?r@Lt@XRBRCjAy@jAcAjBwBx@oCv@eEFw@Ay@UmA}A_DeAkBGk@@qAPsBbCiDzA{BvBkCzBaDBo@?oDLc@h@}A`@k@b@_@dCwAh@u@pCcErBsE`@oA|A}Cd@g@z@g@~EgArDg@h@QnBaAXB^L^PPBh@?zDc@jAUtCQpA?bAFPHt@j@VLTQ^c@bBy@v@Mp@Gv@BlALnCCh@Bd@Jb@?TDbA?j@Qd@UbCyAx@MdAy@h@Qd@B^Ln@x@rCdBzBhDP^d@t@PBd@MRKPCfAJj@?dAUdCUtCkAnBk@lB{@|Ak@b@IjCDr@Fz@Tb@?`@KNTT`BAb@O^Sb@yD`Bg@XQZCp@V`BzCdJp@|AT|@T`BA~@Cb@s@hBC^?l@PdAd@pAd@n@hAp@v@\\XR\\`@bCrE|AhBnApA~EfEb@ZzA`@|APv@@d@Av@Dd@JnIzDxGrCPP@b@i@|AS|@?hARdArBxGR^fBfBn@f@`@Tj@JnCLbMxBf@X`@f@|Rpa@dC`Bb@f@b@l@zCjN\\jAf@|Az@|AzAfBb@r@v@|BX|CVfGBlDS|@}EtF_@x@GbA@jAx@bO`@rA|@rBfAtA|AfA|An@pCz@pAhAfAnBf@xAN|@?z@_@hD\\`BRTpAXhBh@x@n@b@t@hAvDhH|P\\j@rDzCxAl@`Cr@bFfAfAZpA`BjBbF`EpM~BjFz@~AdCbEdArBlDbI|B`GjH|OPt@P|@@dCf@tBlAlDx@|AtCpEL^Lf@Ox@}DbIQf@?\\Fl@Xf@nArBhApEd@fAzDxHd@fA?hAAjA{@tH?^D\\b@fA|KlMlElC|AlAlAzAfA|Ab@t@|A`ElBvD`AhC^f@XP`MoC~Du@~EkAvEaA','3167594580297536460','#273273',46.59,1,'2026-05-23 05:14:34.867','2026-05-23 05:14:34.867',NULL),('2b545520-16a7-4147-a99b-2da37c358b0e','Butiá -> Minas do Leão','pzyvDptc|HvFc@zFYp@Yb@WfJwI`AY|@QjHy@hCg@v@E^Br@Zb@f@f@`CPtAfCtXvBbTFpAn@xFlCzYl@bHbBpQdArJrBnUvAlNvDxa@jD`]|Cn]fDt\\~AdOnBxP~BtSlAfO\\dCbDn[hCpUhB`PfCjVrGhm@JfAh@~EfChVHdCOpA_Ab@wAP@LkKlBsHfAo@eH{BdAaBx@aBp@y@P_OdBmC^uGt@_M`B_','3024728289614917202','#273273',11.24,1,'2026-05-23 05:17:36.467','2026-05-23 05:17:36.467',NULL),('4d2e85ca-b713-4db9-ab58-ff0e295bd0c8','Santo Amaro do Sul -> General Camara','|fvuD`ow{HAaH_ICsATyF?@gFn@oDDk@?i@U}Aa@oAeGqL}@}@yA_AoBaA{D}AmEcAs@]gCyCw@g@wHwCi@Ya@[Yc@c@}@cCyHiAmCi@aBwDwLeAsCsBmC_ByA_CgAeCg@}AI}A@cDb@kCd@gBLkCG_Cc@gDcBgGcEaBk@iEcA{DYiB?}@IqB_@cHOi@F]Lo@n@_B`CgAfAcBnA{@f@eADs@I}IwBqDcx@O}FTyFpEgq@j@uL@wDO}NDo@Ly@|@mELcALoA?gAOsCmB}LAm@D}Ap@kGz@uGvD{^rByUfJg_At@uGZuDDwDkA}k@SkHUmDm@{Kg@aIa@aJYgF?eE@_FzAig@?oA{@qLOwBu@idBQok@NeBh@gCLUv@sAv@k@rAm@eBXg@Po@Zi@t@e@ISKMWCa@?wE@}AVsBNm@jByEBu@UwD|AC`DQ`ACUmA_','3007667420057044860','#273273',16.53,1,'2026-05-23 05:20:41.654','2026-05-23 05:20:41.654',NULL),('600f0dd6-3ffc-4f16-826a-7cae7819d5fc','Barão do Triunfo -> Arroio dos Ratos','ynxDdrwzHwE`A_FjA_Et@aMnCYQ_@g@aAiCmBwD}AaEc@u@gA}AmA{A}AmAmEmC}KmMc@gAE]?_@z@uH@kA?iAe@gA{DyHe@gAiAqEoAsBYg@Gm@?]Pg@|DcINy@Mg@M_@uCqEy@}AmAmDg@uBAeCQ}@Qu@kH}O}BaGmDcIeAsBeCcE{@_B_CkFaEqMkBcFqAaBgA[cFgAaCs@yAm@sD{C]k@aGdBs@Cw@Qi@_@cCmD{@q@cEsAuHmDmBm@u@CiXb@mEf@cDPqUmEmJsCoCuA}@KkAJYLaAtAo@j@_ALeFEa@YqBeDgCeBe@Me@BcCfAo@Lw@Io@]mB}BiAg@gGcBiHeB}HyAsBUw@_@q@y@}@{Ae@c@kBgAc@IeCKu@Si@a@i@m@gAk@}Ac@w@[UUs@gAeAeA_BmAw@aA{@k@q@Qi@BmAb@sD\\g@GsC}AiCwBuC}CyCsBe@Is@DeAXaEj@e@?mLoAe@CiAT{A^y@f@sIhJc@Ze@Jq@H_ACiDQuFc@{BUuCy@iAMmACsEJeACw@Qi@c@_@k@y@sDWc@gF}A_Ak@wA_@qHk@wAFoAVaFhBqBPcDCqC_@eFaAcFm@mEc@WDcAt@iAxAg@|@a@vB@fB|@tTFt@Aj@c@xA_@j@g@b@i@TqBj@u@ZkAbAqBhCw@PaAFw@KwB_Ai@Gq@LuB~By@dDyBrB{@h@{@XgB?WZgCvA_UlEoKfJuCxEc@|@Sp@?jARdC?p@Cj@a@f@yClA{Lj@aEb@kEImEYw@IiAB}@v@qA|AiDrFaA`CgArDkArDmAvBeLlLiDpNkEdNyGzKk@xAmB`Je@fA}@t@_C\\_LPqBLiCZgFrAqZfAeJCuAPsY`Hq@LyNwDkC_AoFy@kHy@aBYyAc@kAu@gNqLkAy@eGgBwACmATgK`EyPx@w@XeAbAgClFQhBU`Bs@bAoDdBaCx@uGd@u@SoEmCkAc@aJyBiAg@oKsGqPyHiA_@mVmE}c@aAyAQ_EcA{FoAaHc@}DHeCSoWgF_CaA}ByA{FwEmAo@_Bc@{AIiKQw@TKZ?|AC\\wCdEc@t@Eb@D|AR|@p@nBTrClAtGNfACrAgAbGc@jAa@b@{@PoAFmBYoB_@kEsB_FsBuBm@kCO}DM}@YmAcAu@uAs@u@qAeAw@Ik^cFeBg@}HyGqPsIyN_HyHkFwIaI{AWoEVsC|@}FxB{C`AiALuLMiAGwJkAw@Juy@`^wG`CgGjBeG`BwHnAm@x@wCbFq@b@y@x@wC~AaFbDsGpEiLtHsKxGuMnJw@`@oBVgACkASsFt@_ACw@Ha@`@c@rCSZsFcAc@Yy@y@q@}AuBuH{BqFYwAyCaSgAaGy@mF]g@gMoPu@g@kKmD_CcAcVgMm@UWEmOgAkBCoADmEn@aMrBoBHaVgA_@G?vCWxGO~IQjDmBf{@OfBCnB','3167594801094784992','#273273',43.44,1,'2026-05-23 05:16:45.966','2026-05-23 05:16:45.966',NULL),('70a71278-523e-4657-8216-727f4af68675','Charqueadas -> São Jerônimo','nyzuD`nazHa@vCS~@Sj@y@h@WJi@LcDJaCVgALqGj@UBOHuC`@sFd@`@fENt@FPbAb@f@PdAj@h@TfCtAxB|AtC|Ad@^xAnBv@n@Zp@`IxNpBlElLbU~@dCRdALpAAC@vAGfBKnAeApKcA`L_@lEkApKO`EwAxg@]pM_@|IcAl_@aAlLmBrPcB`PqCdYm@bMa@nUyAxv@@`CP~DjEza@b@jFdAnHl@tGrAfPpAxNPdCBvACfB?CoFd]cIdg@]hCe@xT_Ka@oIQoBAQDwAvAGPF^Z^d@\\hAp@z@Df_@|@_','3007668662019916668','#273273',12.14,1,'2026-05-23 05:19:33.247','2026-05-23 05:19:33.247',NULL),('8f2a0f7a-1e53-43de-83a5-93a392d3c503','São Jerônimo -> Arroio dos Ratos','z}zuDpouzHlFPpJTpIZxBTxAXfCt@bD|ApBnAnI`F^TZ`ATPV?j@Dbx@pf@hVfOtH~DhC`AnJ|A|e@~GtbAdOdm@nIhUlD~Ez@rCt@tCjAzAt@pBoChKsPbAaBRW~@g@zA_@vQeCfGu@p@UlKuGh@YxAg@|EyAvJwDzAg@v@CjAFjK?jGDhALbHd@hGd@jD`@fBCz@UbB}@zAcAvCeBtDkBhCgBr@Y|Bc@fDaAxCMpACzABtALx@FrWb@~DB`GG`Oc@rDQpJy@~@QzEaC`HiFtKsIlDeChAaAjAe@pAUfB?vKf@l@Qt[mJjBk@z@MvC?lAI\\?dEY~GCfJn@xCZlA\\HD`@BhC_@vD}@h@[vCiDt@kAPc@NGtCl@FJrF|ANHNE@UT]jDQ?{F','3024729101863555016','#273273',15.52,1,'2026-05-23 05:21:50.141','2026-05-23 05:21:50.141',NULL),('94d9753c-c1ea-456a-9622-ca1a9ca09bc0','General Câmara -> Triunfo','|ypuD`f}zHTz@aABaDP}ABTvDCt@kBxEOl@WrBA|A?vEJbCo@v@uFnFiApA{ArBy@`AkDjDeFpEeD~CaCtAyAX}KfA_Fl@_AAmFkA_IsBiIiBiCi@yN{Ee@]s@cAyJqRuN}WeCaGmAgBkA}@kHmFoFeDw@YqYc@_FwC}BsCcBsCi@c@]?UHa@\\OCWM_I_FaCmESoACsBBsC?eB]}AuFqMeMq[yJyUsMa\\oCmGyBeH_CaIiJmZq@iE?uADeA\\}B`@oArBqFbAiDZ_Az@qDnCiMr@uCd@{@h@u@r@]nAuB`BsGf@cA\\aAd@g@b@[tBy@fBYtBi@zAo@`@[Tc@Du@xA_CtLaS\\oAFg@b@]hBgBjAt@jB|@PBtAh@dATtCPlDQ~YaD~NeBzTaCzPcBl|@cKrAU~DWfBH~@T`LhEfDjAlg@xLzC~@`G`Ct@Tl@Jr@@dAEhAQ~JiDtAUpEU|AF`Cb@hDbAhAb@jAn@xJxGxAp@bBj@nCf@~F~@~@XbFz@xDdA`Cf@fGjB|AZlEb@fDT|BXjDx@xIxBhLvA~Bf@pCb@bBbAx@Lv@FnJCpK?rFLlDBdA?lDu@Lf@j@b@X}@_','3007668046252207866','#273273',19.68,1,'2026-05-23 05:20:09.632','2026-05-23 05:20:09.632',NULL),('b8d17c80-0e56-49d7-8f9d-5ebbf9693fbe','Santo Amaro do Sul -> Vale Verde','|fvuD`ow{HcDB?|CkGB{@TwD?gEH]LYXWf@s@t@oBdBo@h@s@`@y@^s@LyGn@wCd@{Db@w@NwF`BwD~@kBn@{@RwANmCDo@Pc@\\S^cB~FuDlI{@jBy@nAiAjAw@p@_BnBmBhCw@~@i@FeGUaJGkF?}FQuCWkBe@i@[u@g@q@IaAPsCB{@DgHnAwGfAuTdC_I`As@@g@MqB}@}Bu@}@_@kAq@c@OSEoBDg@Jc@TaFfGyAtAmBxBi@f@e@Fe@C}A[kBg@sBc@{AYg@GyDJSP{DxAwFLpA|@vFzBhBfAxAxA~@tAdAnBXfA^`BbKjo@FdDCrDQrHyE`gAgA|\\_NzgDQhBg@jDqFvQsBjFeDdFeTlWgA`BoAjCm@|AgBfHOnAIrA\\|DtEl_@r@|GNdCDvDA|AObE_D~a@a@fHg@~Du@dDQ~COdDUhQ@lGvApa@v@`^j@t`@NvCd@dDf@vCbAdCxCpGv@~Cb@vDnA`QdHzt@FtGUxNH`CF|ADvCE|FcFln@AjA@fAHbAxBzIRnAP`DAtAa@hDUjAiB~E_A~Ea@zBkBvSYrCy@nFs@jCWt@a@rAeCpG{EhLi@`AgArBuClD{C`DyOdQgAfAmRdOeAbAg@p@mArCe@zBg@hDa@pAi@vAs@~@iArA}@x@c`@vRgMpGaFvCgGvDwElC}CvBoAbAih@lg@m@fAgAhCUbAMrAKpBFnATlC?`Cg@lFyGve@aAhEcCzJw@hCcB`EcFpKy@`Cm@rBW|BShBM|BKbGm@vRUbD_@nBe@bBu@vBi^rq@oBrCoB`C{AtAg|AbiAwCfCwAvAePhSy@|@gAp@kKzCeQfFsD~@gd@rIyAP}DLi\\g@}AIkAQyAYuQ_Fo@MeAIkA@gAN}@RiBx@{AvAge@dl@g@t@y@t@eAnAu@xAi@dCgDbTOrB~@nW^bFp@fBR|@NlE_CHc@JeUzKoKlE','3007668224216829820','#273273',39.65,1,'2026-05-23 05:21:15.433','2026-05-23 05:21:15.433',NULL),('c852eb3a-e732-4c65-ad83-d444fda55c07','Charqueadas -> Arroio dos Ratos','zxzuDhxazH|ABz@vCjD~@bDfAbAXGvB~Hh@pBThA?p@dBdB|G^bARHRBd@?FMZQpCPtMb@fIb@zLb@pITzBPjBFrBBlDLFqFLgAJUvZtAzX`AfXfApa@nAf_@vEjJx@xBb@BXQrE^J~L|Bl@^~B`BPFlBg@d@CvCPtG~@f@d@fC`Ev@hBzAnBrDrD~GkIFCL?tDjBdB^^Ev@c@bBoA~AaBJm@KaAm@cA_BsCOu@Ba@P[bAu@fBc@bE]n@WpDmCnAq@zAk@pBwEb@QjAZvDoPfMvCbCx@~BfBlAvBlBxAfJhF|H`BlEpEvDlERJhLjDfEdCjLvHtBjAd@P~Fz@xCrARBvOc@fDk@~Dy@~EoAhDq@hAQ|@LjHrB|MlDjEtAXbG@fGSdBe@`BqMpZu@jCk@zDu@pS@fAzBlJf@jC?t@{@~B_@pA{@|@c@x@Ol@AhBS~@eKxTy@vB[^If@}AlDuD~Gc@jAGvAqFn`@ItDLlENxBRlFP~Kd@dONpFtBdRdA~Jd@`K^~CJVr@\\`BZj@X`BnBd@b@t@LxBThBb@~Ap@h@\\nChDjD`DlFxFj@ZlV~EpC|@jEvCv@x@rBvDrF`Jd@n@f@pAvDjNVxANzBHtBxB~e@y@jUSfBU|@a@fAe@|BQdAAx@@~@h@~F`AtEz@vDt@hKz@rG|AhKlBvDDb@d@rHPpAL\\`B|AdAfAbJhL|DvEjAe@pAUfB?vKf@l@Qt[mJjBk@z@MvC?lAI\\?dEY~GCfJn@xCZlA\\HD`@BhC_@vD}@h@[vCiDt@kAPc@NGtCl@FJrF|ANHNE@UT]jDQAiE','3024727868187306952','#273273',25.24,1,'2026-05-23 05:18:57.021','2026-05-23 05:18:57.021',NULL),('e0aaf285-7c8a-4ebd-bf45-185e77e33c6a','Butiá -> São Jerônimo','jf{vDjbc|H{As@}H}DaCiAkUiLcLiFi@c@w@YC^F`CCaDkNgHuIcE_J{D{CkAuHeD}ReImRkIy@g@qFiEoPyNkDsCaSaIuGoCaFiDuCsCQ}GByA`@cG?o@Ac@mCmKyBmMmByLOm@Ug@e@c@{AkAiDsDaB}AsN{N_ByA_JsEqBs@cBu@}KeFwJuEwDsBe@[WYk@uAqAqJc@aCa@kA[i@{E}EgGqGaDsDo@iA_BaDiJcT[m@{AwAuC}BmEcFaCeDy@eBuC}CaFaHy@oAu@i@oBkBcAaBy@iCCqAhB{JDkA?eB}@yIw@{Co@wDLyAd@}AlEeH?c@}B{FmDkFkNoNwEiEa]e^e@wDAeDeA}Ay@_AkDmDwMyNQg@I}@}@qGa@kAgJeKoB{BuCmFiBcEqA{Ew@oAsF{Lk`@_}@kEuL}A_FmAiCgAcBw@_DmK}p@i@{D_CeMQqC}BmN{@qEOkBRmQp@cHDeICcAWmCcA_GyCeP]k@kQ_VyG}HWUyBc@y@CmLj@cCPi@?u@U_SqJ{LsFoGcDsCgBc@u@qBkHiAqEiByGeB}Ic@mCmDkNgHeXQWsEgGwEuF}UcZ}DwDuDiDaBeC}D{LcAiD}@yF}AyFw@mDwBaF_EeP[qF?k@j@oItAqMPy@`I}T`@uAVwCgCwLmCcLsB_K?u@P_@nLoIx@u@`BoBlBiBhEoDhN}MrCsCv@}@aCQWBwBuAaB}@qBu@aFkAoCgA{GcDuCgBo@UgC[qAKmEu@mAk@kEaC}@m@eD_Eu@UqQuBiCwAoLuFe@Qe@Iw@CyFn@wCoBfAcDwYo_@waAgm@c@kAqAMaNgIcD}AgCu@yAYyBUkEQ{Tm@_n','3024728961245899346','#273273',33.64,1,'2026-05-23 05:18:21.820','2026-05-23 05:18:21.820',NULL),('f082034b-b417-47cb-8103-4b4f0eaed941','Triunfo -> São Jerônimo','ltwuDnitzH\\sALE`CHOaAgCkKc@gDe@m@kCj@y@aIGQjDkBhBqChX_NvPBfDb@?BrFx@hDt@dGfAnL`ClEp@lE|@cJxj@]hCe@xT_Ka@oIQoBAQDwAvAGRF\\Z^d@\\hAp@rADr]x@_','3007667833274213244','#273273',5.08,1,'2026-05-23 05:23:05.841','2026-05-23 05:23:05.841',NULL),('f8bf549f-7425-45ed-adac-065c0a482a46','Arroio dos Ratos -> Butiá','rbtvDvtuzH?pGnNu@~DIjAGtC\\`DPzCVPF|AL`CFzD_@vIo@zI_@vDCvDMPLj@`BMtG`Dx@~@ZxCjAbD|@l@?xDZ|Ad@`Ad@fAnAdBzBlA~@lC`AnGrCfMdEnD|@rMvBTHfUzDx@XlDLxEBbCD`@IrBy@dAQXB^Lf@^bAxA|@n@hAj@`Ab@`@TfA~AhAx@dDj@xCt@TB`@CbCm@nBa@b@C|Dd@pFz@l@TG|@Kx@W~@e@jA?f@P|@|AhEd@`BLj@B~@Rt@T^z@|@~ChClA|At@^~@n@zB`DNZHnBYvAmAdCaAbAk@f@]b@Ap@Lf@`@p@h@j@nAt@^`@h@`DLbAAr@y@lGK`BNlFXx@hBzBfAfBh@nA`CdEv@nAfAbArAt@d@`@p@~@TjALnBDPLXpCdEBP?zEb@n@VTzHjATLPPpCtFjAtEb@x@bCnCrBvCt@tATnAr@|ICvCBn@Th@xAvBtFfG|A|AnBzCd@~@t@dCnEvIjAzDzCbNJp@?p@c@rFwCdMKn@C~@N|AVdBtAlDBb@@f@kBtNCf@BT~BtIR\\`@ZhDnB|B`AhDfAlBnAtAjAzBxBtB`CZj@JfAEb@}AlFA\\PrBc@~E?nJi@|AK\\Nb@rFdJhCtJjCzPPb@R\\dCvCjAdELt@?|@KpAO`A{AfGQtAGjNAp@gA|EuC`LSnAU|BILWrAgDvIKh@\\vHCx@gBjHWf@ULwBFaB?k@PwAv@hB~BbAdCtEzLxBpSpJlMx@zCb@t@~BjBlAXj@Hl@`@xBnCvAxAvFlLb@b@jAr@lIjBf@f@zAxB|A|Fb@LtF}A`@BuDjIu@tAyQbTi@dA}Sjs@Wb@q@\\y@Ti@DoEi@mBCkALwKjBgCE}AQwMuCu@Eq@?mATsJ|C}GhBcCb@gUjBsBFuA?mESuBSkBa@qAe@eG_DkAc@w@MgA?u`@nCa@C`@BZX|BZx@PfAb@|NxOR\\lAhCL^P|@BpAr@xE@l@?dBQxBEhDF\\RVfB`A~@fAxA`C`EvJbA|Ah@Xd@DxACxC{@t@Ot@BTFfAj@bC|AJZH|@NrCTnCPt@pGdQf@`Ax@jAtCfC~H|Fb@l@pBvGhAzE?^M|@gIlR}BfGmBrIuAfHW`B{@zEQf@kDtHiArCO|@Cj@?p@|@zRl@dChA`DpA~ChAzDd@tBhA|GX`AbAfBbBzBdAbAVj@^Zr@TTThA|ANp@XrCbA~Ef@|AhAvCz@~CL`CnAxIb@hBRf@t@bAbBjBlI~JlA|BfAjCt@tDx@zD`BtFfArCbCdEtCpEv@|AjAtEPpACzBA`DMfBe@pCe@lDu@jDCx@@j@Db@nErItE`I|DtFOl@MfA{CdIe@b@sFt@eGfAu@Xw@t@sFzEqLrJuChCcCvCqBdBuGvE{JvJo@b@sVbNeA`@gTrFe@Tg@`@uDlFmA|C}AtE{@fFSx@q@bAgCnBiAf@eH~@wF`AiE|@SHeErCoChBe@PmBVkBQQ?[TqAj@w@DiCf@kHx@sBf@w@j@{HnHc@Vq@XaKj@aFb@','3024728126930025042','#273273',37.27,1,'2026-05-23 05:13:10.843','2026-05-23 05:13:10.843',NULL);
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stamps`
--

DROP TABLE IF EXISTS `user_stamps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stamps` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anchor_point_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `route_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `earned_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_stamps_user_id_fkey` (`user_id`),
  KEY `user_stamps_anchor_point_id_fkey` (`anchor_point_id`),
  KEY `user_stamps_route_id_fkey` (`route_id`),
  CONSTRAINT `user_stamps_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_stamps_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_stamps_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stamps`
--

LOCK TABLES `user_stamps` WRITE;
/*!40000 ALTER TABLE `user_stamps` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stamps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pass` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('92309947-2983-4f80-91bf-f08bce61cfaf','testesilva','Teste','Silva','teste@silva.com','$2b$10$KsifzevOD5WwiH748/5LwOK1PHXTBNCLdI0q/EYDkue/KR8jGI0D2','2026-06-02 22:07:12.329','2026-06-02 22:07:12.329'),('df4122fc-54c2-4e75-ab1d-6518284490a1','mateussperess','Mateus Peres','Lopes','mateus@email.com','$2b$10$lMg88m27sJceB8hefZZez.UO48DCXmZwBDFcvuzEwmGCLQN/BuB3.','2026-06-02 22:08:26.740','2026-06-02 22:08:26.740');
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

-- Dump completed on 2026-08-05  3:35:55
