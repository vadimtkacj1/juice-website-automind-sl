const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Оптимизация изображений апельсинов
 */

const ORANGE_IMAGES = [
  {
    input: 'public/oranges/orange-slice-1.png',
    outputs: [
      { file: 'public/oranges/orange-slice-1.webp', format: 'webp', quality: 90 },
    ],
    resize: { width: 400, height: null, fit: 'inside' }
  },
  {
    input: 'public/oranges/orange-slice-2.png',
    outputs: [
      { file: 'public/oranges/orange-slice-2.webp', format: 'webp', quality: 90 },
    ],
    resize: { width: 400, height: null, fit: 'inside' }
  },
  {
    input: 'public/oranges/orange-wedge.png',
    outputs: [
      { file: 'public/oranges/orange-wedge.webp', format: 'webp', quality: 90 },
    ],
    resize: { width: 400, height: null, fit: 'inside' }
  },
];

async function optimizeImage(config) {
  const { input, outputs, resize } = config;

  if (!fs.existsSync(input)) {
    console.log(`⚠️  Файл не найден: ${input}`);
    return;
  }

  console.log(`\n📸 Обработка: ${input}`);

  const stats = fs.statSync(input);
  const originalSize = (stats.size / 1024).toFixed(2);
  console.log(`   Оригинальный размер: ${originalSize} KB`);

  let image = sharp(input);

  if (resize) {
    image = image.resize(resize.width, resize.height, { fit: resize.fit, withoutEnlargement: true });
  }

  for (const output of outputs) {
    try {
      const outputPath = output.file;

      await image
        .clone()
        .webp({ quality: output.quality, effort: 6 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024).toFixed(2);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);

      console.log(`   ✅ WebP: ${newSize} KB (экономия ${savings}%)`);
    } catch (error) {
      console.error(`   ❌ Ошибка:`, error.message);
    }
  }
}

async function optimizeAllImages() {
  console.log('🍊 Оптимизация изображений апельсинов...\n');

  for (const imageConfig of ORANGE_IMAGES) {
    await optimizeImage(imageConfig);
  }

  console.log('\n✨ Готово!');
}

optimizeAllImages().catch(console.error);
