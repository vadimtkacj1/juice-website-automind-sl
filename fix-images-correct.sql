-- Fix all image paths by ID based on init-database.sql
-- This will update all menu items to use English filenames

-- First, show current state
SELECT 'BEFORE UPDATE:' as status;
SELECT id, name, image FROM menu_items ORDER BY id LIMIT 10;

-- Update all image paths by ID
UPDATE menu_items SET image = '/uploads/menu/Pomegranate 0.5 L.jpg' WHERE id = 1;
UPDATE menu_items SET image = '/uploads/menu/Orange 0.5 L.jpg' WHERE id = 2;
UPDATE menu_items SET image = '/uploads/menu/Grapefruit 0.5 L.jpg' WHERE id = 3;
UPDATE menu_items SET image = '/uploads/menu/Carrot 0.5 L.jpg' WHERE id = 4;
UPDATE menu_items SET image = '/uploads/menu/Apple 0.5 L.jpg' WHERE id = 5;
UPDATE menu_items SET image = '/uploads/menu/Beet 0.5 L.jpg' WHERE id = 6;
UPDATE menu_items SET image = '/uploads/menu/pomegranate 1 liter.jpg' WHERE id = 7;
UPDATE menu_items SET image = '/uploads/menu/Orange 1 Liter.jpg' WHERE id = 8;
UPDATE menu_items SET image = '/uploads/menu/Grapefruit 1 Liter.jpg' WHERE id = 9;
UPDATE menu_items SET image = '/uploads/menu/Carrot 1 Liter.jpg' WHERE id = 10;
UPDATE menu_items SET image = '/uploads/menu/Apple 1 Liter.jpg' WHERE id = 11;
UPDATE menu_items SET image = '/uploads/menu/Beet 1 Liter.jpg' WHERE id = 12;

-- Shakes (IDs 13-20)
UPDATE menu_items SET image = '/uploads/menu/shake-healthy.jpg' WHERE id = 13;
UPDATE menu_items SET image = '/uploads/menu/shake-sweet.jpg' WHERE id = 14;
UPDATE menu_items SET image = '/uploads/menu/shake-tropical.jpg' WHERE id = 15;
UPDATE menu_items SET image = '/uploads/menu/shake-tasty.jpg' WHERE id = 16;
UPDATE menu_items SET image = '/uploads/menu/shake-paradise.jpg' WHERE id = 17;
UPDATE menu_items SET image = '/uploads/menu/shake-classic.jpg' WHERE id = 18;
UPDATE menu_items SET image = '/uploads/menu/shake-refreshing.jpg' WHERE id = 19;
UPDATE menu_items SET image = '/uploads/menu/shake-addictive.jpg' WHERE id = 20;

-- Platters (IDs 21-24)
UPDATE menu_items SET image = '/uploads/menu/platter-fruits-large.jpg' WHERE id = 21;
UPDATE menu_items SET image = '/uploads/menu/platter-fruits-medium.jpg' WHERE id = 22;
UPDATE menu_items SET image = '/uploads/menu/platter-vegetables-large.jpg' WHERE id = 23;
UPDATE menu_items SET image = '/uploads/menu/platter-vegetables-medium.jpg' WHERE id = 24;

-- Salads (IDs 25-28)
UPDATE menu_items SET image = '/uploads/menu/bowl-fruits-large.jpg' WHERE id = 25;
UPDATE menu_items SET image = '/uploads/menu/bowl-fruits-medium.jpg' WHERE id = 26;
UPDATE menu_items SET image = '/uploads/menu/salad-vegetables-large.jpg' WHERE id = 27;
UPDATE menu_items SET image = '/uploads/menu/salad-vegetables-medium.jpg' WHERE id = 28;

-- Special Packages for Gatherings (IDs 29-35)
UPDATE menu_items SET image = '/uploads/menu/package-6cola-zero-snacks.jpg' WHERE id = 29;
UPDATE menu_items SET image = '/uploads/menu/package-6cola-zero-gummies.jpg' WHERE id = 30;
UPDATE menu_items SET image = '/uploads/menu/package-6cola-zero-nuts.jpg' WHERE id = 31;
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-gummies.jpg' WHERE id = 32;
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-6malabi.jpg' WHERE id = 33;
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-nuts-platter.jpg' WHERE id = 34;
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-fruits-platter.jpg' WHERE id = 35;

-- Special Packages for Love (IDs 36-42)
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-chocolates.jpg' WHERE id = 36;
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-couples.jpg' WHERE id = 37;
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-fruits.jpg' WHERE id = 38;
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-gummies.jpg' WHERE id = 39;
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-flowers-chocolates.jpg' WHERE id = 40;
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-flowers-fruits.jpg' WHERE id = 41;
UPDATE menu_items SET image = '/uploads/menu/romantic-luxury-desserts.jpg' WHERE id = 42;

-- Desserts (IDs 43-49)
UPDATE menu_items SET image = '/uploads/menu/dessert-malabi.jpg' WHERE id = 43;
UPDATE menu_items SET image = '/uploads/menu/dessert-bavarian.jpg' WHERE id = 44;
UPDATE menu_items SET image = '/uploads/menu/dessert-chocolate-mousse.jpg' WHERE id = 45;
UPDATE menu_items SET image = '/uploads/menu/dessert-knafeh.jpg' WHERE id = 46;
UPDATE menu_items SET image = '/uploads/menu/dessert-family-platter.jpg' WHERE id = 47;
UPDATE menu_items SET image = '/uploads/menu/dessert-tasty-waffle.jpg' WHERE id = 48;
UPDATE menu_items SET image = '/uploads/menu/dessert-healthy-waffle.jpg' WHERE id = 49;

-- Verify the changes
SELECT 'AFTER UPDATE:' as status;
SELECT id, name, image FROM menu_items ORDER BY id;
