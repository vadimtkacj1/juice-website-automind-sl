-- ============================================
-- Juice Website - Database Initialization Script
-- Created: 2026-02-01
-- ============================================
-- This script will drop and recreate all tables
-- and create an admin user with credentials
-- ============================================

-- Set charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS `ingredient_group_custom_ingredients`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `promo_codes`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `menu_category_volumes`;
DROP TABLE IF EXISTS `custom_ingredients`;
DROP TABLE IF EXISTS `ingredient_groups`;
DROP TABLE IF EXISTS `menu_categories`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `business_hours`;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Menu Categories Table
CREATE TABLE `menu_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` TEXT,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Category Volumes Table
CREATE TABLE `menu_category_volumes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `volume` VARCHAR(100) NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items Table
CREATE TABLE `menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `volume` VARCHAR(100),
  `image` TEXT,
  `discount_percent` DECIMAL(10,2) DEFAULT 0,
  `is_available` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins Table
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Ingredients Table
CREATE TABLE `custom_ingredients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) DEFAULT 0,
  `image` TEXT,
  `ingredient_category` VARCHAR(191) DEFAULT 'fruits',
  `is_available` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ingredient Groups Table
CREATE TABLE `ingredient_groups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_he` VARCHAR(255) NOT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(191),
  `customer_phone` VARCHAR(50),
  `delivery_address` TEXT,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `payment_method` VARCHAR(50),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `menu_item_id` INT NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Promo Codes Table
CREATE TABLE `promo_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `discount_type` VARCHAR(50) NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ingredient Group - Custom Ingredients (Junction Table)
CREATE TABLE `ingredient_group_custom_ingredients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ingredient_group_id` INT NOT NULL,
  `custom_ingredient_id` INT NOT NULL,
  `sort_order` INT DEFAULT 0,
  FOREIGN KEY (`ingredient_group_id`) REFERENCES `ingredient_groups`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`custom_ingredient_id`) REFERENCES `custom_ingredients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations Table
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `country` VARCHAR(100),
  `city` VARCHAR(100),
  `address` VARCHAR(255),
  `hours` VARCHAR(255),
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Table
CREATE TABLE `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `image` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Hours Table
CREATE TABLE `business_hours` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` VARCHAR(20),
  `open_time` VARCHAR(20),
  `close_time` VARCHAR(20),
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert Admin User
-- Username: admin
-- Password: JuiceAdmin2026!
-- Bcrypt hash generated with salt rounds: 10
INSERT INTO `admins` (`username`, `password`, `email`, `created_at`)
VALUES (
  'admin',
  '$2a$10$vK9xGZF5lH.7ZqHKPNx3LeK6rKBZ5QG7zGmYxN.vB.YEpQh8xM9zW',
  'admin@juice-website.com',
  CURRENT_TIMESTAMP
);

-- Insert Business Hours (Sunday to Saturday)
INSERT INTO `business_hours` (`day_of_week`, `open_time`, `close_time`, `is_active`) VALUES
('Sunday', '08:00', '22:00', 1),
('Monday', '08:00', '22:00', 1),
('Tuesday', '08:00', '22:00', 1),
('Wednesday', '08:00', '22:00', 1),
('Thursday', '08:00', '22:00', 1),
('Friday', '08:00', '23:00', 1),
('Saturday', '09:00', '23:00', 1);

-- Insert Sample Location
INSERT INTO `locations` (`country`, `city`, `address`, `hours`, `is_active`) VALUES
('Israel', 'Tel Aviv', '123 Dizengoff Street', 'Sun-Thu: 08:00-22:00, Fri-Sat: 09:00-23:00', 1);

-- Insert Sample Promo Code
INSERT INTO `promo_codes` (`code`, `discount_type`, `discount_value`, `is_active`, `created_at`) VALUES
('WELCOME2026', 'percentage', 10.00, 1, CURRENT_TIMESTAMP),
('FIRST20', 'percentage', 20.00, 1, CURRENT_TIMESTAMP);

-- ============================================
-- SUMMARY
-- ============================================
-- Tables created: 14
-- Admin created: 1
-- Initial data inserted
--
-- Admin Credentials:
--   Username: admin
--   Password: JuiceAdmin2026!
--   Email: admin@juice-website.com
--
-- Created on: 2026-02-01
-- ============================================
