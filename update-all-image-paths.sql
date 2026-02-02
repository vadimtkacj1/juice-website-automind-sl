-- Update all image paths from Hebrew to English names

-- Packages with cola
UPDATE menu_items SET image = '/uploads/menu/package-6cola-zero-gummies.jpg' WHERE image = '/uploads/menu/6 קולה_ זירו + גומיות.jpg';
UPDATE menu_items SET image = '/uploads/menu/package-6cola-zero-nuts.jpg' WHERE image = '/uploads/menu/6 קולה_ זירו + פיצוחים.jpg';
UPDATE menu_items SET image = '/uploads/menu/package-6cola-zero-snacks.jpg' WHERE image = '/uploads/menu/6קולה_ זירו + עשר 6 חטיפים שונים.jpg';

-- Shakes
UPDATE menu_items SET image = '/uploads/menu/shake-healthy.jpg' WHERE image = '/uploads/menu/טבעי שזה בריא.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-sweet.jpg' WHERE image = '/uploads/menu/טבעי שזה מתוק.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-tropical.jpg' WHERE image = '/uploads/menu/טבעי שזה טרופי.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-tasty.jpg' WHERE image = '/uploads/menu/טבעי שזה טעים.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-paradise.jpg' WHERE image = '/uploads/menu/טבעי שזה גן עדן.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-classic.jpg' WHERE image = '/uploads/menu/טבעי שזה קלאסי.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-refreshing.jpg' WHERE image = '/uploads/menu/טבעי שזה מרענן.jpg';
UPDATE menu_items SET image = '/uploads/menu/shake-addictive.jpg' WHERE image = '/uploads/menu/טבעי שזה ממכר.jpg';

-- Platters
UPDATE menu_items SET image = '/uploads/menu/platter-fruits-large.jpg' WHERE image = '/uploads/menu/מגש גדול של פרות העונה +רימון+ תמרים עם אגוזים +גומיות.jpg';
UPDATE menu_items SET image = '/uploads/menu/platter-fruits-medium.jpg' WHERE image = '/uploads/menu/מגש בינוני  של פרות העונה +רימון+ תמרים עם אגוזים +גומיות.jpg';
UPDATE menu_items SET image = '/uploads/menu/platter-vegetables-large.jpg' WHERE image = '/uploads/menu/מגש גדול של ירקות  +תירס גמדי + דקל +זיתים.jpg';
UPDATE menu_items SET image = '/uploads/menu/platter-vegetables-medium.jpg' WHERE image = '/uploads/menu/מגש בינוני של ירקות + תירס גמדי + דקל +זיתים.jpg';

-- Bowls/Salads
UPDATE menu_items SET image = '/uploads/menu/bowl-fruits-large.jpg' WHERE image = '/uploads/menu/קערה גדולה  של פרות העונה +רימון.jpg';
UPDATE menu_items SET image = '/uploads/menu/bowl-fruits-medium.jpg' WHERE image = '/uploads/menu/קערה בינונית של פרות העונה +רימון.jpg';
UPDATE menu_items SET image = '/uploads/menu/salad-vegetables-large.jpg' WHERE image = '/uploads/menu/סלט ירקות גדול ( בצל בצד).jpg';
UPDATE menu_items SET image = '/uploads/menu/salad-vegetables-medium.jpg' WHERE image = '/uploads/menu/סלט ירקות בינוני (בצל בצד).jpg';

-- Packages with Arak
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-gummies.jpg' WHERE image = '/uploads/menu/ערק + 6 אקסלים + גומי.jpg';
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-6malabi.jpg' WHERE image = '/uploads/menu/ערק + 6 אקסלים + 6 מלבי.jpg';
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-nuts-platter.jpg' WHERE image = '/uploads/menu/ערק + 6 אקסלים + מגש פיצוחים.jpg';
UPDATE menu_items SET image = '/uploads/menu/package-arak-6excel-fruits-platter.jpg' WHERE image = '/uploads/menu/ערק + 6 אקסלים + מגש פירות בינוני.jpg';

-- Romantic packages
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-chocolates.jpg' WHERE image = '/uploads/menu/טבעי שזה מפנק.jpg';
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-couples.jpg' WHERE image = '/uploads/menu/טבעי שזה זוגי.jpg';
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-fruits.jpg' WHERE image = '/uploads/menu/טבעי שזה קורץ.jpg';
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-gummies.jpg' WHERE image = '/uploads/menu/טבעי שזה מפרגן.jpg';
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-flowers-chocolates.jpg' WHERE image = '/uploads/menu/טבעי שזה נעים.jpg';
UPDATE menu_items SET image = '/uploads/menu/romantic-wine-flowers-fruits.jpg' WHERE image = '/uploads/menu/טבעי שזה חמים.jpg';
UPDATE menu_items SET image = '/uploads/menu/romantic-luxury-desserts.jpg' WHERE image = '/uploads/menu/טבעי שזה של הביוקר.jpg';

-- Desserts
UPDATE menu_items SET image = '/uploads/menu/dessert-malabi.jpg' WHERE image = '/uploads/menu/טבעי שזה מלבי.jpg';
UPDATE menu_items SET image = '/uploads/menu/dessert-bavarian.jpg' WHERE image = '/uploads/menu/טבעי שזה בוואריה.jpg';
UPDATE menu_items SET image = '/uploads/menu/dessert-chocolate-mousse.jpg' WHERE image = '/uploads/menu/טבעי שזה מוס שוקולד.jpg';
UPDATE menu_items SET image = '/uploads/menu/dessert-knafeh.jpg' WHERE image = '/uploads/menu/טבעי שזה קדאיף.jpg';
UPDATE menu_items SET image = '/uploads/menu/dessert-family-platter.jpg' WHERE image = '/uploads/menu/מגש משפחתי מרענן.jpg';
UPDATE menu_items SET image = '/uploads/menu/dessert-tasty-waffle.jpg' WHERE image = '/uploads/menu/טבעי שזה טעים (קינוחים).jpg';
UPDATE menu_items SET image = '/uploads/menu/dessert-healthy-waffle.jpg' WHERE image = '/uploads/menu/טבעי שזה בריא (קינוחים).jpg';

-- Verify updates
SELECT id, name, image FROM menu_items WHERE image LIKE '/uploads/menu/%' ORDER BY id;
