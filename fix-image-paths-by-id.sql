-- First, let's see what we have in the database
SELECT id, name, image FROM menu_items ORDER BY id;

-- If the above shows Hebrew characters in image paths, we'll update by using string replacement
-- This approach doesn't try to match Hebrew text, it just replaces any Hebrew characters

-- Alternative: Update using REPLACE to change the upload path structure
-- This will work regardless of encoding issues
UPDATE menu_items SET image = CONCAT('/uploads/menu/',
    CASE
        -- Packages with cola
        WHEN image LIKE '%6 %_ % + %.jpg' AND image LIKE '%קולה%' AND image LIKE '%זירו%' AND image LIKE '%גומיות%' THEN 'package-6cola-zero-gummies.jpg'
        WHEN image LIKE '%6 %_ % + %.jpg' AND image LIKE '%קולה%' AND image LIKE '%זירו%' AND image LIKE '%פיצוחים%' THEN 'package-6cola-zero-nuts.jpg'
        WHEN image LIKE '%6%_ % + % 6 %.jpg' AND image LIKE '%קולה%' AND image LIKE '%זירו%' THEN 'package-6cola-zero-snacks.jpg'

        -- Shakes - all start with "טבעי שזה"
        WHEN image LIKE '%בריא.jpg%' AND image LIKE '%טבעי%' AND image NOT LIKE '%קינוחים%' THEN 'shake-healthy.jpg'
        WHEN image LIKE '%מתוק.jpg%' AND image LIKE '%טבעי%' THEN 'shake-sweet.jpg'
        WHEN image LIKE '%טרופי.jpg%' AND image LIKE '%טבעי%' THEN 'shake-tropical.jpg'
        WHEN image LIKE '%טעים.jpg%' AND image LIKE '%טבעי%' AND image NOT LIKE '%קינוחים%' THEN 'shake-tasty.jpg'
        WHEN image LIKE '%גן עדן.jpg%' AND image LIKE '%טבעי%' THEN 'shake-paradise.jpg'
        WHEN image LIKE '%קלאסי.jpg%' AND image LIKE '%טבעי%' THEN 'shake-classic.jpg'
        WHEN image LIKE '%מרענן.jpg%' AND image LIKE '%טבעי%' AND image NOT LIKE '%משפחתי%' THEN 'shake-refreshing.jpg'
        WHEN image LIKE '%ממכר.jpg%' AND image LIKE '%טבעי%' THEN 'shake-addictive.jpg'

        -- Platters
        WHEN image LIKE '%מגש גדול%' AND image LIKE '%פרות%' AND image LIKE '%רימון%' THEN 'platter-fruits-large.jpg'
        WHEN image LIKE '%מגש בינוני%' AND image LIKE '%פרות%' AND image LIKE '%רימון%' THEN 'platter-fruits-medium.jpg'
        WHEN image LIKE '%מגש גדול%' AND image LIKE '%ירקות%' THEN 'platter-vegetables-large.jpg'
        WHEN image LIKE '%מגש בינוני%' AND image LIKE '%ירקות%' THEN 'platter-vegetables-medium.jpg'

        -- Bowls/Salads
        WHEN image LIKE '%קערה גדולה%' AND image LIKE '%פרות%' THEN 'bowl-fruits-large.jpg'
        WHEN image LIKE '%קערה בינונית%' AND image LIKE '%פרות%' THEN 'bowl-fruits-medium.jpg'
        WHEN image LIKE '%סלט ירקות גדול%' THEN 'salad-vegetables-large.jpg'
        WHEN image LIKE '%סלט ירקות בינוני%' THEN 'salad-vegetables-medium.jpg'

        -- Packages with Arak
        WHEN image LIKE '%ערק%' AND image LIKE '%אקסלים%' AND image LIKE '%גומי%' THEN 'package-arak-6excel-gummies.jpg'
        WHEN image LIKE '%ערק%' AND image LIKE '%אקסלים%' AND image LIKE '%מלבי%' THEN 'package-arak-6excel-6malabi.jpg'
        WHEN image LIKE '%ערק%' AND image LIKE '%אקסלים%' AND image LIKE '%פיצוחים%' THEN 'package-arak-6excel-nuts-platter.jpg'
        WHEN image LIKE '%ערק%' AND image LIKE '%אקסלים%' AND image LIKE '%פירות%' THEN 'package-arak-6excel-fruits-platter.jpg'

        -- Romantic packages
        WHEN image LIKE '%מפנק.jpg%' AND image LIKE '%טבעי%' THEN 'romantic-wine-chocolates.jpg'
        WHEN image LIKE '%זוגי.jpg%' AND image LIKE '%טבעי%' THEN 'romantic-wine-couples.jpg'
        WHEN image LIKE '%קורץ.jpg%' AND image LIKE '%טבעי%' THEN 'romantic-wine-fruits.jpg'
        WHEN image LIKE '%מפרגן.jpg%' AND image LIKE '%טבעי%' THEN 'romantic-wine-gummies.jpg'
        WHEN image LIKE '%נעים.jpg%' AND image LIKE '%טבעי%' THEN 'romantic-wine-flowers-chocolates.jpg'
        WHEN image LIKE '%חמים.jpg%' AND image LIKE '%טבעי%' THEN 'romantic-wine-flowers-fruits.jpg'
        WHEN image LIKE '%הביוקר%' AND image LIKE '%טבעי%' THEN 'romantic-luxury-desserts.jpg'

        -- Desserts
        WHEN image LIKE '%מלבי.jpg%' AND image LIKE '%טבעי%' THEN 'dessert-malabi.jpg'
        WHEN image LIKE '%בוואריה.jpg%' AND image LIKE '%טבעי%' THEN 'dessert-bavarian.jpg'
        WHEN image LIKE '%מוס שוקולד%' AND image LIKE '%טבעי%' THEN 'dessert-chocolate-mousse.jpg'
        WHEN image LIKE '%קדאיף%' AND image LIKE '%טבעי%' THEN 'dessert-knafeh.jpg'
        WHEN image LIKE '%משפחתי מרענן%' THEN 'dessert-family-platter.jpg'
        WHEN image LIKE '%טעים%' AND image LIKE '%קינוחים%' THEN 'dessert-tasty-waffle.jpg'
        WHEN image LIKE '%בריא%' AND image LIKE '%קינוחים%' THEN 'dessert-healthy-waffle.jpg'

        ELSE SUBSTRING_INDEX(image, '/', -1)
    END
)
WHERE image LIKE '%uploads/menu/%';

-- Verify the changes
SELECT id, name, image FROM menu_items WHERE image LIKE '/uploads/menu/%' ORDER BY id;
