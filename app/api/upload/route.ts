import { NextRequest, NextResponse } from 'next/server';
import { optimizeImage, validateImage, generatePlaceholder } from '@/lib/image-optimizer';

// For Next.js 13+ App Router - increase timeout for large file uploads
export const maxDuration = 30;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';
    const quality = parseInt((formData.get('quality') as string) || '85');
    const generateWebP = (formData.get('generateWebP') as string) !== 'false';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB; aligned with nginx/client limits)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate image
    const validation = await validateImage(buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid image' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Optimize image
    const optimizedResult = await optimizeImage(buffer, filename, folder, {
      quality,
      generateWebP,
      generateThumbnail: true,
      maxWidth: 1920,
      maxHeight: 1920,
    });

    // Generate placeholder for lazy loading
    const placeholder = await generatePlaceholder(buffer);

    // Calculate compression ratio
    const compressionRatio = ((1 - optimizedResult.size / file.size) * 100).toFixed(1);

    return NextResponse.json({
      success: true,
      url: optimizedResult.originalUrl,
      webpUrl: optimizedResult.webpUrl,
      thumbnailUrl: optimizedResult.thumbnailUrl,
      placeholder,
      width: optimizedResult.width,
      height: optimizedResult.height,
      originalSize: file.size,
      optimizedSize: optimizedResult.size,
      compressionRatio: `${compressionRatio}%`,
      format: optimizedResult.format,
      filename: filename,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

