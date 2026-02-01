# Скрипт для переименования файлов меню с иврита на английский

$menuPath = "public\uploads\menu"
cd $menuPath

# Массив переименований: старое имя -> новое имя
$renames = @{
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

    # Salads
    "קערה גדולה  של פרות העונה +רימון.jpg" = "salad-fruits-large.jpg"
    "קערה בינונית של פרות העונה +רימון.jpg" = "salad-fruits-medium.jpg"
    "סלט ירקות גדול ( בצל בצד).jpg" = "salad-vegetables-large.jpg"
    "סלט ירקות בינוני (בצל בצד).jpg" = "salad-vegetables-medium.jpg"

    # Special packages
    "6 קולה_ זירו + גומיות.jpg" = "package-cola-gummies.jpg"
    "6 קולה_ זירו + פיצוחים.jpg" = "package-cola-nuts.jpg"
    "6קולה_ זירו + עשר 6 חטיפים שונים.jpg" = "package-cola-snacks.jpg"
    "ערק + 6 אקסלים + גומי.jpg" = "package-arak-excel-gummies.jpg"
    "ערק + 6 אקסלים + 6 מלבי.jpg" = "package-arak-excel-malabi.jpg"
    "ערק + 6 אקסלים + מגש פיצוחים.jpg" = "package-arak-excel-nuts.jpg"
    "ערק + 6 אקסלים + מגש פירות בינוני.jpg" = "package-arak-excel-fruits.jpg"

    # Romantic packages
    "יין לבן + מארז גומיות.jpg" = "wine-white-gummies.jpg"
    "טבעי שזה מפנק.jpg" = "romantic-indulgent.jpg"
    "טבעי שזה זוגי.jpg" = "romantic-couples.jpg"
    "טבעי שזה קורץ.jpg" = "romantic-wink.jpg"
    "טבעי שזה מפרגן.jpg" = "romantic-generous.jpg"
    "טבעי שזה נעים.jpg" = "romantic-pleasant.jpg"
    "טבעי שזה חמים.jpg" = "romantic-warm.jpg"
    "טבעי שזה של הביוקר.jpg" = "romantic-luxury.jpg"

    # Desserts
    "טבעי שזה מלבי.jpg" = "dessert-malabi.jpg"
    "טבעי שזה בוואריה.jpg" = "dessert-bavarian.jpg"
    "טבעי שזה מוס שוקולד.jpg" = "dessert-chocolate-mousse.jpg"
    "טבעי שזה קדאיף.jpg" = "dessert-knafeh.jpg"
    "מגש משפחתי מרענן.jpg" = "dessert-family-platter.jpg"
    "טבעי שזה טעים (קינוחים).jpg" = "dessert-tasty.jpg"
    "טבעי שזה בריא (קינוחים).jpg" = "dessert-healthy.jpg"
}

# Переименование файлов
foreach ($old in $renames.Keys) {
    $new = $renames[$old]
    if (Test-Path $old) {
        Rename-Item -Path $old -NewName $new -Force
        Write-Host "✓ Renamed: $old -> $new"
    } else {
        Write-Host "✗ Not found: $old"
    }
}

Write-Host "`n✅ Renaming complete!"
