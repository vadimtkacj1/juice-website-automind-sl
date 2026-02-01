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

-- Menu Item Volumes Table
CREATE TABLE `menu_item_volumes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menu_item_id` INT NOT NULL,
  `volume` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Item Custom Ingredients Table
CREATE TABLE `menu_item_custom_ingredients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menu_item_id` INT NOT NULL,
  `custom_ingredient_id` INT NOT NULL,
  `ingredient_group` VARCHAR(191),
  `ingredient_group_id` INT,
  `selection_type` VARCHAR(50) DEFAULT 'multiple',
  `price_override` DECIMAL(10,2),
  `is_required` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `volume_prices` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`custom_ingredient_id`) REFERENCES `custom_ingredients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ingredient_group_id`) REFERENCES `ingredient_groups`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Category Custom Ingredients Table
CREATE TABLE `menu_category_custom_ingredients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `custom_ingredient_id` INT NOT NULL,
  `ingredient_group` VARCHAR(191),
  `ingredient_group_id` INT,
  `selection_type` VARCHAR(50) DEFAULT 'multiple',
  `price_override` DECIMAL(10,2),
  `is_required` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `volume_prices` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`custom_ingredient_id`) REFERENCES `custom_ingredients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ingredient_group_id`) REFERENCES `ingredient_groups`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Item Additional Items Table
CREATE TABLE `menu_item_additional_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menu_item_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) DEFAULT 0,
  `is_available` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
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

-- Insert Menu Categories
INSERT INTO `menu_categories` (`name`, `description`, `sort_order`, `is_active`, `created_at`) VALUES
('סוחטים', 'מיצים טבעיים טריים סחוטים במקום', 1, 1, CURRENT_TIMESTAMP),
('שייקים', 'שייקים קרמיים ומרעננים', 2, 1, CURRENT_TIMESTAMP),
('מגשי ארוח', 'מגשי ארוחה מושלמים לכל אירוע', 3, 1, CURRENT_TIMESTAMP),
('סלטים', 'סלטים טריים ובריאים', 4, 1, CURRENT_TIMESTAMP),
('מיוחדים לישיבות', 'מנות מיוחדות לישיבות עסקיות', 5, 1, CURRENT_TIMESTAMP),
('מיוחדים לאהבה', 'מנות רומנטיות מיוחדות', 6, 1, CURRENT_TIMESTAMP),
('קינוחים', 'קינוחים מתוקים ומפנקים', 7, 1, CURRENT_TIMESTAMP);

-- Insert Menu Items - Juices (0.5 Liter)
INSERT INTO `menu_items` (`category_id`, `name`, `description`, `price`, `volume`, `image`, `is_available`, `sort_order`, `created_at`) VALUES
(1, 'סוחט רימון', 'מיץ רימון טרי סחוט - כוס חצי ליטר', 25.00, '0.5L', '/uploads/menu/Pomegranate 0.5 L.jpg', 1, 1, CURRENT_TIMESTAMP),
(1, 'סוחט תפוזים', 'מיץ תפוזים טרי סחוט - כוס חצי ליטר', 20.00, '0.5L', '/uploads/menu/Orange 0.5 L.jpg', 1, 2, CURRENT_TIMESTAMP),
(1, 'סוחט אשכוליות', 'מיץ אשכוליות טרי סחוט - כוס חצי ליטר', 20.00, '0.5L', '/uploads/menu/Grapefruit 0.5 L.jpg', 1, 3, CURRENT_TIMESTAMP),
(1, 'סוחט גזר', 'מיץ גזר טרי סחוט - כוס חצי ליטר', 25.00, '0.5L', '/uploads/menu/Carrot 0.5 L.jpg', 1, 4, CURRENT_TIMESTAMP),
(1, 'סוחט תפוחים', 'מיץ תפוחים טרי סחוט - כוס חצי ליטר', 25.00, '0.5L', '/uploads/menu/Apple 0.5 L.jpg', 1, 5, CURRENT_TIMESTAMP),
(1, 'סוחט סלק', 'מיץ סלק טרי סחוט - כוס חצי ליטר', 25.00, '0.5L', '/uploads/menu/Beet 0.5 L.jpg', 1, 6, CURRENT_TIMESTAMP),
-- Juices (1 Liter)
(1, 'סוחט רימון', 'מיץ רימון טרי סחוט - בקבוק ליטר', 40.00, '1L', '/uploads/menu/pomegranate 1 liter.jpg', 1, 7, CURRENT_TIMESTAMP),
(1, 'סוחט תפוזים', 'מיץ תפוזים טרי סחוט - בקבוק ליטר', 40.00, '1L', '/uploads/menu/Orange 1 Liter.jpg', 1, 8, CURRENT_TIMESTAMP),
(1, 'סוחט אשכוליות', 'מיץ אשכוליות טרי סחוט - בקבוק ליטר', 40.00, '1L', '/uploads/menu/Grapefruit 1 Liter.jpg', 1, 9, CURRENT_TIMESTAMP),
(1, 'סוחט גזר', 'מיץ גזר טרי סחוט - בקבוק ליטר', 50.00, '1L', '/uploads/menu/Carrot 1 Liter.jpg', 1, 10, CURRENT_TIMESTAMP),
(1, 'סוחט תפוחים', 'מיץ תפוחים טרי סחוט - בקבוק ליטר', 50.00, '1L', '/uploads/menu/Apple 1 Liter.jpg', 1, 11, CURRENT_TIMESTAMP),
(1, 'סוחט סלק', 'מיץ סלק טרי סחוט - בקבוק ליטר', 50.00, '1L', '/uploads/menu/Beet 1 Liter.jpg', 1, 12, CURRENT_TIMESTAMP),
-- Shakes
(2, 'טבעי שזה בריא', 'בננה + מנגו + אננס + בננה + אוכמניות | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/טבעי שזה בריא.jpg', 1, 1, CURRENT_TIMESTAMP),
(2, 'טבעי שזה מתוק', 'בננה + אננס + תות + מקופלת + פסק זמן | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/טבעי שזה מתוק.jpg', 1, 2, CURRENT_TIMESTAMP),
(2, 'טבעי שזה טרופי', 'מנגו + אננס + בננה + אוכמניות | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/טבעי שזה טרופי.jpg', 1, 3, CURRENT_TIMESTAMP),
(2, 'טבעי שזה טעים', 'תפוח + מלון + בננה + תפוח + קיווי + אננס | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/טבעי שזה טעים.jpg', 1, 4, CURRENT_TIMESTAMP),
(2, 'טבעי שזה גן עדן', 'בננה + מלון + אפרסק + אננס + תות + חלווה | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/טבעי שזה גן עדן.jpg', 1, 5, CURRENT_TIMESTAMP),
(2, 'טבעי שזה קלאסי', 'תות + בננה + אננס + מנגו | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 45.00, 'Regular', '/uploads/menu/טבעי שזה קלאסי.jpg', 1, 6, CURRENT_TIMESTAMP),
(2, 'טבעי שזה מרענן', 'מיקס פרות טרופיים קפואים + בננה + אננס | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 45.00, 'Regular', '/uploads/menu/טבעי שזה מרענן.jpg', 1, 7, CURRENT_TIMESTAMP),
(2, 'טבעי שזה ממכר', 'בננה + אוכמניות + תפוח + שוקולד + פסק זמן | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 45.00, 'Regular', '/uploads/menu/טבעי שזה ממכר.jpg', 1, 8, CURRENT_TIMESTAMP),
-- Platters
(3, 'טבעי ותוסס על המגש - גדול', 'מגש גדול של פרות העונה + רימון + תמרים עם אגוזים + גומיות', 300.00, 'Large', '/uploads/menu/מגש גדול של פרות העונה +רימון+ תמרים עם אגוזים +גומיות.jpg', 1, 1, CURRENT_TIMESTAMP),
(3, 'טבעי ותוסס על המגש - בינוני', 'מגש בינוני של פרות העונה + רימון + תמרים עם אגוזים + גומיות', 200.00, 'Medium', '/uploads/menu/מגש בינוני  של פרות העונה +רימון+ תמרים עם אגוזים +גומיות.jpg', 1, 2, CURRENT_TIMESTAMP),
(3, 'טבעי ובריא על המגש - גדול', 'מגש גדול של ירקות + תירס גמדי + דקל + זיתים', 200.00, 'Large', '/uploads/menu/מגש גדול של ירקות  +תירס גמדי + דקל +זיתים.jpg', 1, 3, CURRENT_TIMESTAMP),
(3, 'טבעי ובריא על המגש - בינוני', 'מגש בינוני של ירקות + זיתים + דקל + תירס גמדי', 150.00, 'Medium', '/uploads/menu/מגש בינוני של ירקות + תירס גמדי + דקל +זיתים.jpg', 1, 4, CURRENT_TIMESTAMP),
-- Salads
(4, 'סלט פירות טבעי שזה מרענן - גדול', 'קערה גדולה של פרות העונה + רימון', 160.00, 'Large', '/uploads/menu/קערה גדולה  של פרות העונה +רימון.jpg', 1, 1, CURRENT_TIMESTAMP),
(4, 'סלט פירות טבעי שזה מרענן - בינוני', 'קערה בינונית של פרות העונה + רימון', 140.00, 'Medium', '/uploads/menu/קערה בינונית של פרות העונה +רימון.jpg', 1, 2, CURRENT_TIMESTAMP),
(4, 'סלט ירקות טבעי שזה מרענן - גדול', 'סלט ירקות גדול (בצל בצד) + תירס גמדי + דקל + זיתים', 120.00, 'Large', '/uploads/menu/סלט ירקות גדול ( בצל בצד).jpg', 1, 3, CURRENT_TIMESTAMP),
(4, 'סלט ירקות טבעי שזה מרענן - בינוני', 'סלט ירקות בינוני (בצל בצד) + תירס גמדי + דקל + זיתים', 100.00, 'Medium', '/uploads/menu/סלט ירקות בינוני (בצל בצד).jpg', 1, 4, CURRENT_TIMESTAMP),
-- Special Packages for Gatherings
(5, 'טבעי שזה חטיפים שונים', 'זירו קולה 6 + עשר 6 חטיפים שונים', 200.00, 'Package', '/uploads/menu/6קולה_ זירו + עשר 6 חטיפים שונים.jpg', 1, 1, CURRENT_TIMESTAMP),
(5, 'טבעי שזה נכון', 'זירו קולה 6 + גומיות', 200.00, 'Package', '/uploads/menu/6 קולה_ זירו + גומיות.jpg', 1, 2, CURRENT_TIMESTAMP),
(5, 'טבעי שזה מותר', 'זירו קולה 6 + פיצוחים', 200.00, 'Package', '/uploads/menu/6 קולה_ זירו + פיצוחים.jpg', 1, 3, CURRENT_TIMESTAMP),
(5, 'טבעי שזה ביחד', 'ערק + גומיות + אקסל/ווקדה 6', 400.00, 'Package', '/uploads/menu/ערק + 6 אקסלים + גומי.jpg', 1, 4, CURRENT_TIMESTAMP),
(5, 'טבעי שזה סופ"ש', 'ערק + 6 מלבי + אקסל/ווקדה 6', 400.00, 'Package', '/uploads/menu/ערק + 6 אקסלים + 6 מלבי.jpg', 1, 5, CURRENT_TIMESTAMP),
(5, 'טבעי שזה משמח', 'ערק + אקסל + ווקדה 6 + מגש פיצוחים', 440.00, 'Package', '/uploads/menu/ערק + 6 אקסלים + מגש פיצוחים.jpg', 1, 6, CURRENT_TIMESTAMP),
(5, 'טבעי שזה חברי', 'ערק + מגש פרות בינוני + אקסל/ווקדה 6', 480.00, 'Package', '/uploads/menu/ערק + 6 אקסלים + מגש פירות בינוני.jpg', 1, 7, CURRENT_TIMESTAMP),
-- Special Packages for Love
(6, 'טבעי שזה מפנק', 'יין אדום/לבן + מארז שוקולדים', 300.00, 'Romantic', '/uploads/menu/טבעי שזה מפנק.jpg', 1, 1, CURRENT_TIMESTAMP),
(6, 'טבעי שזה זוגי', 'יין לבן + מארז פיצוחים / יין אדום', 300.00, 'Romantic', '/uploads/menu/טבעי שזה זוגי.jpg', 1, 2, CURRENT_TIMESTAMP),
(6, 'טבעי שזה קורץ', 'יין לבן + מגש פרות זוגי / יין אדום', 350.00, 'Romantic', '/uploads/menu/טבעי שזה קורץ.jpg', 1, 3, CURRENT_TIMESTAMP),
(6, 'טבעי שזה מפרגן', 'יין אדום/לבן + מארז גומיות', 320.00, 'Romantic', '/uploads/menu/טבעי שזה מפרגן.jpg', 1, 4, CURRENT_TIMESTAMP),
(6, 'טבעי שזה נעים', 'יין + פרחים + מארז שוקולד', 400.00, 'Romantic', '/uploads/menu/טבעי שזה נעים.jpg', 1, 5, CURRENT_TIMESTAMP),
(6, 'טבעי שזה חמים', 'יין + פרחים + מגש פרות', 400.00, 'Romantic', '/uploads/menu/טבעי שזה חמים.jpg', 1, 6, CURRENT_TIMESTAMP),
(6, 'טבעי שזה של הביוקר', 'יין 2 + מוס שוקולד 2 + קדאיף 2 + בווריה 2 + מלבי 2 + מארז קינוחים', 350.00, 'Romantic', '/uploads/menu/טבעי שזה של הביוקר.jpg', 1, 7, CURRENT_TIMESTAMP),
-- Desserts
(7, 'טבעי שזה מלבי', '6 מלבי', 100.00, 'Dessert', '/uploads/menu/טבעי שזה מלבי.jpg', 1, 1, CURRENT_TIMESTAMP),
(7, 'טבעי שזה בווריה', '6 בווריה', 100.00, 'Dessert', '/uploads/menu/טבעי שזה בוואריה.jpg', 1, 2, CURRENT_TIMESTAMP),
(7, 'טבעי שזה מוס שוקולד', '6 מוס שוקולד', 100.00, 'Dessert', '/uploads/menu/טבעי שזה מוס שוקולד.jpg', 1, 3, CURRENT_TIMESTAMP),
(7, 'טבעי שזה קדאיף', '6 קדאיף', 100.00, 'Dessert', '/uploads/menu/טבעי שזה קדאיף.jpg', 1, 4, CURRENT_TIMESTAMP),
(7, 'מגש משפחתי מרענן', '2 קדאיף + 2 מוס שוקולד + 2 בווריה + 2 מלבי', 140.00, 'Dessert', '/uploads/menu/מגש משפחתי מרענן.jpg', 1, 5, CURRENT_TIMESTAMP),
(7, 'טבעי שזה טעים - קינוח', 'קדאיף/מוס/מלבי/וופל בלגי + 2 בווריה', 80.00, 'Dessert', '/uploads/menu/טבעי שזה טעים (קינוחים).jpg', 1, 6, CURRENT_TIMESTAMP),
(7, 'טבעי שזה בריא - קינוח', 'וופל בלגי + 2 קערית פרות', 80.00, 'Dessert', '/uploads/menu/טבעי שזה בריא (קינוחים).jpg', 1, 7, CURRENT_TIMESTAMP);

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
