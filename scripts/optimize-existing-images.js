const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const BACKUP_DIR = path.join(process.cwd(), 'public', 'uploads-backup');

// Поддерживаемые форматы
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Оптимизирует изображение
 */
async function optimizeImage(filePath, quality = 85) {
  try {
    const buffer = await fs.readFile(filePath);
    const image = sharp(buffer);
    const metadata = await image.metadata();

    console.log(`  📸 ${path.basename(filePath)}`);
    console.log(`     Original: ${(buffer.length / 1024).toFixed(1)} KB, ${metadata.width}x${metadata.height}`);

    const ext = path.extname(filePath).toLowerCase();
    const nameWithoutExt = path.basename(filePath, ext);
    const dir = path.dirname(filePath);

    // Определяем размеры для ресайза
    let resizeOptions = {};
    if (metadata.width > 1920) {
      resizeOptions.width = 1920;
    }
    if (metadata.height > 1920) {
      resizeOptions.height = 1920;
    }

    // Оптимизируем оригинальное изображение
    let optimizedBuffer;
    if (ext === '.jpg' || ext === '.jpeg') {
      optimizedBuffer = await image
        .resize(resizeOptions)
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .toBuffer();
    } else if (ext === '.png') {
      optimizedBuffer = await image
        .resize(resizeOptions)
        .png({ quality, compressionLevel: 9, palette: true })
        .toBuffer();
    } else if (ext === '.webp') {
      optimizedBuffer = await image
        .resize(resizeOptions)
        .webp({ quality })
        .toBuffer();
    } else {
      optimizedBuffer = await image.resize(resizeOptions).toBuffer();
    }

    // Сохраняем оптимизированное изображение
    await fs.writeFile(filePath, optimizedBuffer);

    // Генерируем WebP версию (если не WebP уже)
    if (ext !== '.webp') {
      const webpBuffer = await sharp(optimizedBuffer)
        .webp({ quality })
        .toBuffer();
      
      const webpPath = path.join(dir, `${nameWithoutExt}.webp`);
      await fs.writeFile(webpPath, webpBuffer);
      
      console.log(`     WebP: ${(webpBuffer.length / 1024).toFixed(1)} KB`);
    }

    // Генерируем миниатюру
    const thumbnailBuffer = await sharp(optimizedBuffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 70 })
      .toBuffer();
    
    const thumbnailPath = path.join(dir, `${nameWithoutExt}-thumb.webp`);
    await fs.writeFile(thumbnailPath, thumbnailBuffer);

    const compressionRatio = ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1);
    console.log(`     Optimized: ${(optimizedBuffer.length / 1024).toFixed(1)} KB (saved ${compressionRatio}%)`);
    console.log(`     Thumbnail: ${(thumbnailBuffer.length / 1024).toFixed(1)} KB`);

    return {
      original: buffer.length,
      optimized: optimizedBuffer.length,
      saved: buffer.length - optimizedBuffer.length,
    };
  } catch (error) {
    console.error(`  ❌ Error optimizing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Рекурсивно находит все изображения в директории
 */
async function findImages(dir) {
  const images = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Рекурсивно обходим поддиректории
        const subImages = await findImages(fullPath);
        images.push(...subImages);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          // Пропускаем уже оптимизированные файлы (миниатюры и WebP)
          if (!entry.name.includes('-thumb.') && !entry.name.endsWith('.webp')) {
            images.push(fullPath);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return images;
}

/**
 * Создает backup существующих изображений
 */
async function createBackup() {
  console.log('📦 Creating backup...');
  
  try {
    // Проверяем существует ли директория uploads
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      console.log('⚠️  No uploads directory found. Nothing to optimize.');
      return false;
    }

    // Создаем backup директорию
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Копируем все файлы
    await copyDirectory(UPLOADS_DIR, BACKUP_DIR);
    
    console.log(`✅ Backup created at: ${BACKUP_DIR}\n`);
    return true;
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    return false;
  }
}

/**
 * Копирует директорию рекурсивно
 */
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Форматирует размер в человекочитаемый формат
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Главная функция
 */
async function main() {
  console.log('🖼️  Image Optimization Script\n');
  console.log('This script will:');
  console.log('1. Create a backup of all images');
  console.log('2. Optimize all images in /public/uploads');
  console.log('3. Generate WebP versions');
  console.log('4. Create thumbnails\n');

  // Создаем backup
  const backupCreated = await createBackup();
  if (!backupCreated) {
    return;
  }

  // Находим все изображения
  console.log('🔍 Finding images...');
  const images = await findImages(UPLOADS_DIR);
  
  if (images.length === 0) {
    console.log('⚠️  No images found to optimize.');
    return;
  }

  console.log(`Found ${images.length} image(s) to optimize\n`);

  // Оптимизируем каждое изображение
  let totalOriginal = 0;
  let totalOptimized = 0;
  let successCount = 0;

  for (let i = 0; i < images.length; i++) {
    console.log(`\n[${i + 1}/${images.length}] Processing:`);
    const result = await optimizeImage(images[i]);
    
    if (result) {
      totalOriginal += result.original;
      totalOptimized += result.optimized;
      successCount++;
    }
  }

  // Выводим статистику
  console.log('\n' + '='.repeat(60));
  console.log('📊 Optimization Complete!\n');
  console.log(`✅ Successfully optimized: ${successCount}/${images.length} images`);
  console.log(`📦 Original total size: ${formatBytes(totalOriginal)}`);
  console.log(`📦 Optimized total size: ${formatBytes(totalOptimized)}`);
  console.log(`💾 Total saved: ${formatBytes(totalOriginal - totalOptimized)}`);
  
  if (totalOriginal > 0) {
    const savedPercent = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
    console.log(`📉 Compression ratio: ${savedPercent}%`);
  }
  
  console.log('\n💡 Tips:');
  console.log('- Backup is available at: ' + BACKUP_DIR);
  console.log('- WebP versions have been created for better performance');
  console.log('- Thumbnails have been generated for quick previews');
  console.log('- You can safely delete the backup after verifying everything works');
}

// Запускаем скрипт
main().catch(console.error);

