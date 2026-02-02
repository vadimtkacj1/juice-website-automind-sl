-- Complete database restoration script
-- This will clear all related tables and restore menu items with relationships

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all tables that have foreign keys to menu_items
TRUNCATE TABLE order_items;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE menu_item_volumes;
TRUNCATE TABLE menu_item_custom_ingredients;
TRUNCATE TABLE menu_item_additional_items;
TRUNCATE TABLE menu_items;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

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
(2, 'טבעי שזה בריא', 'בננה + מנגו + אננס + בננה + אוכמניות | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/shake-healthy.jpg', 1, 1, CURRENT_TIMESTAMP),
(2, 'טבעי שזה מתוק', 'בננה + אננס + תות + מקופלת + פסק זמן | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/shake-sweet.jpg', 1, 2, CURRENT_TIMESTAMP),
(2, 'טבעי שזה טרופי', 'מנגו + אננס + בננה + אוכמניות | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/shake-tropical.jpg', 1, 3, CURRENT_TIMESTAMP),
(2, 'טבעי שזה טעים', 'תפוח + מלון + בננה + תפוח + קיווי + אננס | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/shake-tasty.jpg', 1, 4, CURRENT_TIMESTAMP),
(2, 'טבעי שזה גן עדן', 'בננה + מלון + אפרסק + אננס + תות + חלווה | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 30.00, 'Regular', '/uploads/menu/shake-paradise.jpg', 1, 5, CURRENT_TIMESTAMP),
(2, 'טבעי שזה קלאסי', 'תות + בננה + אננס + מנגו | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 45.00, 'Regular', '/uploads/menu/shake-classic.jpg', 1, 6, CURRENT_TIMESTAMP),
(2, 'טבעי שזה מרענן', 'מיקס פרות טרופיים קפואים + בננה + אננס | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 45.00, 'Regular', '/uploads/menu/shake-refreshing.jpg', 1, 7, CURRENT_TIMESTAMP),
(2, 'טבעי שזה ממכר', 'בננה + אוכמניות + תפוח + שוקולד + פסק זמן | ניתן להזמין על בסיס תפוזים/סויה/חלב | תוספות: פקאן, פקאן מסוכר, תמר, פסק זמן, כיף כף, מקופלת, אגוזים, חלווה', 45.00, 'Regular', '/uploads/menu/shake-addictive.jpg', 1, 8, CURRENT_TIMESTAMP),
-- Platters
(3, 'טבעי ותוסס על המגש - גדול', 'מגש גדול של פרות העונה + רימון + תמרים עם אגוזים + גומיות', 300.00, 'Large', '/uploads/menu/platter-fruits-large.jpg', 1, 1, CURRENT_TIMESTAMP),
(3, 'טבעי ותוסס על המגש - בינוני', 'מגש בינוני של פרות העונה + רימון + תמרים עם אגוזים + גומיות', 200.00, 'Medium', '/uploads/menu/platter-fruits-medium.jpg', 1, 2, CURRENT_TIMESTAMP),
(3, 'טבעי ובריא על המגש - גדול', 'מגש גדול של ירקות + תירס גמדי + דקל + זיתים', 200.00, 'Large', '/uploads/menu/platter-vegetables-large.jpg', 1, 3, CURRENT_TIMESTAMP),
(3, 'טבעי ובריא על המגש - בינוני', 'מגש בינוני של ירקות + זיתים + דקל + תירס גמדי', 150.00, 'Medium', '/uploads/menu/platter-vegetables-medium.jpg', 1, 4, CURRENT_TIMESTAMP),
-- Salads
(4, 'סלט פירות טבעי שזה מרענן - גדול', 'קערה גדולה של פרות העונה + רימון', 160.00, 'Large', '/uploads/menu/bowl-fruits-large.jpg', 1, 1, CURRENT_TIMESTAMP),
(4, 'סלט פירות טבעי שזה מרענן - בינוני', 'קערה בינונית של פרות העונה + רימון', 140.00, 'Medium', '/uploads/menu/bowl-fruits-medium.jpg', 1, 2, CURRENT_TIMESTAMP),
(4, 'סלט ירקות טבעי שזה מרענן - גדול', 'סלט ירקות גדול (בצל בצד) + תירס גמדי + דקל + זיתים', 120.00, 'Large', '/uploads/menu/salad-vegetables-large.jpg', 1, 3, CURRENT_TIMESTAMP),
(4, 'סלט ירקות טבעי שזה מרענן - בינוני', 'סלט ירקות בינוני (בצל בצד) + תירס גמדי + דקל + זיתים', 100.00, 'Medium', '/uploads/menu/salad-vegetables-medium.jpg', 1, 4, CURRENT_TIMESTAMP),
-- Special Packages for Gatherings
(5, 'טבעי שזה חטיפים שונים', 'זירו קולה 6 + עשר 6 חטיפים שונים', 200.00, 'Package', '/uploads/menu/package-6cola-zero-snacks.jpg', 1, 1, CURRENT_TIMESTAMP),
(5, 'טבעי שזה נכון', 'זירו קולה 6 + גומיות', 200.00, 'Package', '/uploads/menu/package-6cola-zero-gummies.jpg', 1, 2, CURRENT_TIMESTAMP),
(5, 'טבעי שזה מותר', 'זירו קולה 6 + פיצוחים', 200.00, 'Package', '/uploads/menu/package-6cola-zero-nuts.jpg', 1, 3, CURRENT_TIMESTAMP),
(5, 'טבעי שזה ביחד', 'ערק + גומיות + אקסל/ווקדה 6', 400.00, 'Package', '/uploads/menu/package-arak-6excel-gummies.jpg', 1, 4, CURRENT_TIMESTAMP),
(5, 'טבעי שזה סופ"ש', 'ערק + 6 מלבי + אקסל/ווקדה 6', 400.00, 'Package', '/uploads/menu/package-arak-6excel-6malabi.jpg', 1, 5, CURRENT_TIMESTAMP),
(5, 'טבעי שזה משמח', 'ערק + אקסל + ווקדה 6 + מגש פיצוחים', 440.00, 'Package', '/uploads/menu/package-arak-6excel-nuts-platter.jpg', 1, 6, CURRENT_TIMESTAMP),
(5, 'טבעי שזה חברי', 'ערק + מגש פרות בינוני + אקסל/ווקדה 6', 480.00, 'Package', '/uploads/menu/package-arak-6excel-fruits-platter.jpg', 1, 7, CURRENT_TIMESTAMP),
-- Special Packages for Love
(6, 'טבעי שזה מפנק', 'יין אדום/לבן + מארז שוקולדים', 300.00, 'Romantic', '/uploads/menu/romantic-wine-chocolates.jpg', 1, 1, CURRENT_TIMESTAMP),
(6, 'טבעי שזה זוגי', 'יין לבן + מארז פיצוחים / יין אדום', 300.00, 'Romantic', '/uploads/menu/romantic-wine-couples.jpg', 1, 2, CURRENT_TIMESTAMP),
(6, 'טבעי שזה קורץ', 'יין לבן + מגש פרות זוגי / יין אדום', 350.00, 'Romantic', '/uploads/menu/romantic-wine-fruits.jpg', 1, 3, CURRENT_TIMESTAMP),
(6, 'טבעי שזה מפרגן', 'יין אדום/לבן + מארז גומיות', 320.00, 'Romantic', '/uploads/menu/romantic-wine-gummies.jpg', 1, 4, CURRENT_TIMESTAMP),
(6, 'טבעי שזה נעים', 'יין + פרחים + מארז שוקולד', 400.00, 'Romantic', '/uploads/menu/romantic-wine-flowers-chocolates.jpg', 1, 5, CURRENT_TIMESTAMP),
(6, 'טבעי שזה חמים', 'יין + פרחים + מגש פרות', 400.00, 'Romantic', '/uploads/menu/romantic-wine-flowers-fruits.jpg', 1, 6, CURRENT_TIMESTAMP),
(6, 'טבעי שזה של הביוקר', 'יין 2 + מוס שוקולד 2 + קדאיף 2 + בווריה 2 + מלבי 2 + מארז קינוחים', 350.00, 'Romantic', '/uploads/menu/romantic-luxury-desserts.jpg', 1, 7, CURRENT_TIMESTAMP),
-- Desserts
(7, 'טבעי שזה מלבי', '6 מלבי', 100.00, 'Dessert', '/uploads/menu/dessert-malabi.jpg', 1, 1, CURRENT_TIMESTAMP),
(7, 'טבעי שזה בווריה', '6 בווריה', 100.00, 'Dessert', '/uploads/menu/dessert-bavarian.jpg', 1, 2, CURRENT_TIMESTAMP),
(7, 'טבעי שזה מוס שוקולד', '6 מוס שוקולד', 100.00, 'Dessert', '/uploads/menu/dessert-chocolate-mousse.jpg', 1, 3, CURRENT_TIMESTAMP),
(7, 'טבעי שזה קדאיף', '6 קדאיף', 100.00, 'Dessert', '/uploads/menu/dessert-knafeh.jpg', 1, 4, CURRENT_TIMESTAMP),
(7, 'מגש משפחתי מרענן', '2 קדאיף + 2 מוס שוקולד + 2 בווריה + 2 מלבי', 140.00, 'Dessert', '/uploads/menu/dessert-family-platter.jpg', 1, 5, CURRENT_TIMESTAMP),
(7, 'טבעי שזה טעים - קינוח', 'קדאיף/מוס/מלבי/וופל בלגי + 2 בווריה', 80.00, 'Dessert', '/uploads/menu/dessert-tasty-waffle.jpg', 1, 6, CURRENT_TIMESTAMP),
(7, 'טבעי שזה בריא - קינוח', 'וופל בלגי + 2 קערית פרות', 80.00, 'Dessert', '/uploads/menu/dessert-healthy-waffle.jpg', 1, 7, CURRENT_TIMESTAMP);

-- Show results
SELECT 'Database restored successfully!' as status;
SELECT COUNT(*) as total_menu_items FROM menu_items;
SELECT category_id, COUNT(*) as items_count FROM menu_items GROUP BY category_id;
