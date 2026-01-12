import sharp from 'sharp';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  generateWebP?: boolean;
  generateAvif?: boolean;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface OptimizedImageResult {
  originalUrl: string;
  webpUrl?: string;
  avifUrl?: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number;
  format: string;
  avifSize?: number;
  webpSize?: number;
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1920,
  generateWebP: true,
  generateAvif: true,
  generateThumbnail: true,
  thumbnailSize: 400,
};

/**
 * Оптимизирует изображение: сжимает, конвертирует в WebP и AVIF, создает миниатюры
 * @param buffer - Buffer изображения
 * @param filename - Имя файла
 * @param folder - Папка для сохранения
 * @param options - Опции оптимизации
 */
export async function optimizeImage(
  buffer: Buffer,
  filename: string,
  folder: string = 'general',
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Создаем директорию если не существует
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Получаем метаданные изображения
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Базовое имя без расширения
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const originalExt = path.extname(filename).toLowerCase();

  // Определяем размеры для ресайза
  let resizeOptions: { width?: number; height?: number } = {};
  if (metadata.width && metadata.width > opts.maxWidth!) {
    resizeOptions.width = opts.maxWidth;
  }
  if (metadata.height && metadata.height > opts.maxHeight!) {
    resizeOptions.height = opts.maxHeight;
  }

  // Оптимизируем оригинальное изображение
  let optimizedBuffer: Buffer;
  let outputFormat = originalExt.replace('.', '');

  if (originalExt === '.jpg' || originalExt === '.jpeg') {
    optimizedBuffer = await image
      .resize(resizeOptions)
      .jpeg({ quality: opts.quality, progressive: true, mozjpeg: true })
      .toBuffer();
    outputFormat = 'jpeg';
  } else if (originalExt === '.png') {
    optimizedBuffer = await image
      .resize(resizeOptions)
      .png({ quality: opts.quality, compressionLevel: 9, palette: true })
      .toBuffer();
    outputFormat = 'png';
  } else if (originalExt === '.webp') {
    optimizedBuffer = await image
      .resize(resizeOptions)
      .webp({ quality: opts.quality })
      .toBuffer();
    outputFormat = 'webp';
  } else {
    // Для других форматов просто ресайзим
    optimizedBuffer = await image.resize(resizeOptions).toBuffer();
  }

  // Сохраняем оптимизированное изображение
  const optimizedFilename = `${nameWithoutExt}.${outputFormat}`;
  const optimizedPath = path.join(uploadDir, optimizedFilename);
  await writeFile(optimizedPath, optimizedBuffer);

  // Получаем финальные размеры
  const optimizedImage = sharp(optimizedBuffer);
  const optimizedMetadata = await optimizedImage.metadata();

  const result: OptimizedImageResult = {
    originalUrl: `/uploads/${folder}/${optimizedFilename}`,
    width: optimizedMetadata.width || 0,
    height: optimizedMetadata.height || 0,
    size: optimizedBuffer.length,
    format: outputFormat,
  };

  // Генерируем WebP версию (если не WebP уже)
  if (opts.generateWebP && outputFormat !== 'webp') {
    const webpBuffer = await sharp(optimizedBuffer)
      .webp({ quality: opts.quality })
      .toBuffer();

    const webpFilename = `${nameWithoutExt}.webp`;
    const webpPath = path.join(uploadDir, webpFilename);
    await writeFile(webpPath, webpBuffer);

    result.webpUrl = `/uploads/${folder}/${webpFilename}`;
    result.webpSize = webpBuffer.length;
  }

  // Генерируем AVIF версию (современный формат с лучшим сжатием)
  if (opts.generateAvif && outputFormat !== 'avif') {
    const avifBuffer = await sharp(optimizedBuffer)
      .avif({
        quality: opts.quality,
        effort: 4 // Баланс между скоростью и качеством (0-9, где 4 - хороший баланс)
      })
      .toBuffer();

    const avifFilename = `${nameWithoutExt}.avif`;
    const avifPath = path.join(uploadDir, avifFilename);
    await writeFile(avifPath, avifBuffer);

    result.avifUrl = `/uploads/${folder}/${avifFilename}`;
    result.avifSize = avifBuffer.length;
  }

  // Генерируем миниатюру для быстрого превью
  if (opts.generateThumbnail) {
    const thumbnailBuffer = await sharp(optimizedBuffer)
      .resize(opts.thumbnailSize, opts.thumbnailSize, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 70 })
      .toBuffer();

    const thumbnailFilename = `${nameWithoutExt}-thumb.webp`;
    const thumbnailPath = path.join(uploadDir, thumbnailFilename);
    await writeFile(thumbnailPath, thumbnailBuffer);

    result.thumbnailUrl = `/uploads/${folder}/${thumbnailFilename}`;
  }

  return result;
}

/**
 * Генерирует placeholder (blur data URL) для изображения
 */
export async function generatePlaceholder(buffer: Buffer): Promise<string> {
  const placeholder = await sharp(buffer)
    .resize(20, 20, { fit: 'cover' })
    .blur(10)
    .webp({ quality: 20 })
    .toBuffer();
  
  return `data:image/webp;base64,${placeholder.toString('base64')}`;
}

/**
 * Генерирует responsive srcset для изображения
 */
export async function generateResponsiveImages(
  buffer: Buffer,
  filename: string,
  folder: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): Promise<{ [key: string]: string }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const srcset: { [key: string]: string } = {};

  for (const width of widths) {
    const resizedBuffer = await sharp(buffer)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    
    const resizedFilename = `${nameWithoutExt}-${width}w.webp`;
    const resizedPath = path.join(uploadDir, resizedFilename);
    await writeFile(resizedPath, resizedBuffer);
    
    srcset[`${width}w`] = `/uploads/${folder}/${resizedFilename}`;
  }

  return srcset;
}

/**
 * Валидация изображения
 */
export async function validateImage(buffer: Buffer): Promise<{
  valid: boolean;
  error?: string;
  metadata?: sharp.Metadata;
}> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Проверяем формат
    const allowedFormats = ['jpeg', 'png', 'webp', 'gif', 'avif'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Invalid format. Allowed: ${allowedFormats.join(', ')}`,
      };
    }

    // Проверяем размеры
    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Could not determine image dimensions',
      };
    }

    // Проверяем минимальные размеры
    if (metadata.width < 100 || metadata.height < 100) {
      return {
        valid: false,
        error: 'Image too small. Minimum size: 100x100px',
      };
    }

    // Проверяем максимальные размеры
    if (metadata.width > 10000 || metadata.height > 10000) {
      return {
        valid: false,
        error: 'Image too large. Maximum size: 10000x10000px',
      };
    }

    return {
      valid: true,
      metadata,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Invalid image file',
    };
  }
}

