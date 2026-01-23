const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Оптимизация критических изображений для улучшения производительности
 */

const IMAGES_TO_OPTIMIZE = [
  {
    input: 'public/images/expert-with-table.png',
    outputs: [
      { file: 'public/images/expert-with-table.webp', format: 'webp', quality: 85 },
      { file: 'public/images/expert-with-table.avif', format: 'avif', quality: 80 },
    ],
    resize: { width: 1920, height: null, fit: 'inside' } // Максимум 1920px по ширине
  },
  {
    input: 'public/images/apple.png',
    outputs: [
      { file: 'public/images/apple.webp', format: 'webp', quality: 90 },
      { file: 'public/images/apple.avif', format: 'avif', quality: 85 },
    ],
    resize: { width: 800, height: null, fit: 'inside' }
  },
  {
    input: 'public/images/pomegranede.png',
    outputs: [
      { file: 'public/images/pomegranede.webp', format: 'webp', quality: 90 },
      { file: 'public/images/pomegranede.avif', format: 'avif', quality: 85 },
    ],
    resize: { width: 800, height: null, fit: 'inside' }
  },
  {
    input: 'public/images/strawberry.png',
    outputs: [
      { file: 'public/images/strawberry.webp', format: 'webp', quality: 90 },
      { file: 'public/images/strawberry.avif', format: 'avif', quality: 85 },
    ],
    resize: { width: 800, height: null, fit: 'inside' }
  },
  {
    input: 'public/images/rasberry.png',
    outputs: [
      { file: 'public/images/rasberry.webp', format: 'webp', quality: 90 },
      { file: 'public/images/rasberry.avif', format: 'avif', quality: 85 },
    ],
    resize: { width: 800, height: null, fit: 'inside' }
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
  const originalSize = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   Оригинальный размер: ${originalSize} MB`);

  let image = sharp(input);

  // Применяем resize если указан
  if (resize) {
    image = image.resize(resize.width, resize.height, { fit: resize.fit, withoutEnlargement: true });
  }

  // Генерируем оптимизированные версии
  for (const output of outputs) {
    try {
      const outputPath = output.file;

      if (output.format === 'webp') {
        await image
          .clone()
          .webp({ quality: output.quality, effort: 6 })
          .toFile(outputPath);
      } else if (output.format === 'avif') {
        await image
          .clone()
          .avif({ quality: output.quality, effort: 6 })
          .toFile(outputPath);
      }

      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024 / 1024).toFixed(2);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);

      console.log(`   ✅ ${output.format.toUpperCase()}: ${newSize} MB (экономия ${savings}%)`);
    } catch (error) {
      console.error(`   ❌ Ошибка при создании ${output.format}:`, error.message);
    }
  }
}

async function optimizeAllImages() {
  console.log('🚀 Начинаем оптимизацию изображений...\n');
  console.log('=' .repeat(60));

  for (const imageConfig of IMAGES_TO_OPTIMIZE) {
    await optimizeImage(imageConfig);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Оптимизация завершена!');
  console.log('\n📝 Что дальше:');
  console.log('1. Обновите компоненты для использования WebP/AVIF форматов');
  console.log('2. Используйте Next.js Image компонент для автоматической оптимизации');
  console.log('3. Рассмотрите удаление старых PNG файлов после проверки');
}

optimizeAllImages().catch(console.error);
