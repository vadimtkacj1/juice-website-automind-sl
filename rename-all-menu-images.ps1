# Полный скрипт переименования всех файлов меню

$menuPath = "public\uploads\menu"
cd $menuPath

$renames = @{
    # Packages with cola
    "6 קולה_ זירו + גומיות.jpg" = "package-6cola-zero-gummies.jpg"
    "6 קולה_ זירו + פיצוחים.jpg" = "package-6cola-zero-nuts.jpg"
    "6קולה_ זירו + עשר 6 חטיפים שונים.jpg" = "package-6cola-zero-snacks.jpg"

    # Shakes
    "טבעי שזה בריא.jpg" = "shake-healthy.jpg"
    "טבעי שזה מתוק.jpg" = "shake-sweet.jpg"
    "טבעי שזה טרופי.jpg" = "shake-tropical.jpg"
    "טבעי שזה טעים.jpg" = "shake-tasty.jpg"
    "טבעי שזה גן עדן.jpg" = "shake-paradise.jpg"
    "טבעי שזה קלאסי.jpg" = "shake-classic.jpg"
    "טבעי שזה מרענן.jpg" = "shake-refreshing.jpg"
    "טבעי שזה ממכר.jpg" = "shake-addictive.jpg"

    # Platters
    "מגש גדול של פרות העונה +רימון+ תמרים עם אגוזים +גומיות.jpg" = "platter-fruits-large.jpg"
    "מגש בינוני  של פרות העונה +רימון+ תמרים עם אגוזים +גומיות.jpg" = "platter-fruits-medium.jpg"
    "מגש גדול של ירקות  +תירס גמדי + דקל +זיתים.jpg" = "platter-vegetables-large.jpg"
    "מגש בינוני של ירקות + תירס גמדי + דקל +זיתים.jpg" = "platter-vegetables-medium.jpg"

    # Bowls/Salads
    "קערה גדולה  של פרות העונה +רימון.jpg" = "bowl-fruits-large.jpg"
    "קערה בינונית של פרות העונה +רימון.jpg" = "bowl-fruits-medium.jpg"
    "סלט ירקות גדול ( בצל בצד).jpg" = "salad-vegetables-large.jpg"
    "סלט ירקות בינוני (בצל בצד).jpg" = "salad-vegetables-medium.jpg"

    # Packages with Arak
    "ערק + 6 אקסלים + גומי.jpg" = "package-arak-6excel-gummies.jpg"
    "ערק + 6 אקסלים + 6 מלבי.jpg" = "package-arak-6excel-6malabi.jpg"
    "ערק + 6 אקסלים + מגש פיצוחים.jpg" = "package-arak-6excel-nuts-platter.jpg"
    "ערק + 6 אקסלים + מגש פירות בינוני.jpg" = "package-arak-6excel-fruits-platter.jpg"

    # Romantic packages
    "טבעי שזה מפנק.jpg" = "romantic-wine-chocolates.jpg"
    "טבעי שזה זוגי.jpg" = "romantic-wine-couples.jpg"
    "טבעי שזה קורץ.jpg" = "romantic-wine-fruits.jpg"
    "טבעי שזה מפרגן.jpg" = "romantic-wine-gummies.jpg"
    "טבעי שזה נעים.jpg" = "romantic-wine-flowers-chocolates.jpg"
    "טבעי שזה חמים.jpg" = "romantic-wine-flowers-fruits.jpg"
    "טבעי שזה של הביוקר.jpg" = "romantic-luxury-desserts.jpg"

    # Desserts
    "טבעי שזה מלבי.jpg" = "dessert-malabi.jpg"
    "טבעי שזה בוואריה.jpg" = "dessert-bavarian.jpg"
    "טבעי שזה מוס שוקולד.jpg" = "dessert-chocolate-mousse.jpg"
    "טבעי שזה קדאיף.jpg" = "dessert-knafeh.jpg"
    "מגש משפחתי מרענן.jpg" = "dessert-family-platter.jpg"
    "טבעי שזה טעים (קינוחים).jpg" = "dessert-tasty-waffle.jpg"
    "טבעי שזה בריא (קינוחים).jpg" = "dessert-healthy-waffle.jpg"
}

Write-Host "Starting file renaming process...`n"

foreach ($old in $renames.Keys) {
    $new = $renames[$old]
    if (Test-Path $old) {
        Rename-Item -Path $old -NewName $new -Force
        Write-Host "✓ $old -> $new"
    } else {
        Write-Host "✗ Not found: $old" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Renaming complete! Total files: $($renames.Count)"
