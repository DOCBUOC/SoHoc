/*
 Navicat Premium Data Transfer

 Source Server         : localhost-window
 Source Server Type    : MySQL
 Source Server Version : 100417
 Source Host           : localhost:3306
 Source Schema         : frontend_hieu

 Target Server Type    : MySQL
 Target Server Version : 100417
 File Encoding         : 65001

 Date: 15/10/2024 17:08:14
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for data
-- ----------------------------
DROP TABLE IF EXISTS `data`;
CREATE TABLE `data`  (
                         `id` binary(36) NOT NULL,
                         `month` int NULL DEFAULT NULL,
                         `year` int NULL DEFAULT NULL,
                         `quarter` int NULL DEFAULT NULL,
                         `raw_number` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                         `formatted_number` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                         `day` date NULL DEFAULT NULL,
                         PRIMARY KEY (`id`) USING BTREE,
                         UNIQUE INDEX `unique_day_raw_number`(`day` ASC, `raw_number` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for increment_number
-- ----------------------------
DROP TABLE IF EXISTS `increment_number`;
CREATE TABLE `increment_number`  (
    `increment_number` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Triggers structure for table data
-- ----------------------------
DROP TRIGGER IF EXISTS `auto_generate_month_and_year`;
delimiter ;;
CREATE TRIGGER `auto_generate_month_and_year` BEFORE INSERT ON `data` FOR EACH ROW BEGIN
    DECLARE quarter_value INT;
    SET NEW.month = MONTH(NEW.day);
    SET NEW.year = YEAR(NEW.day);


    SET quarter_value = CEIL(MONTH(NEW.day) / 3);
    SET NEW.quarter = quarter_value;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table data
-- ----------------------------
DROP TRIGGER IF EXISTS `auto_generate_month_and_year_on_update`;
delimiter ;;
CREATE TRIGGER `auto_generate_month_and_year_on_update` BEFORE UPDATE ON `data` FOR EACH ROW BEGIN
    DECLARE quarter_value INT;
    SET NEW.month = MONTH(NEW.day);
    SET NEW.year = YEAR(NEW.day);

    SET quarter_value = CEIL(MONTH(NEW.day) / 3);
    SET NEW.quarter = quarter_value;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
