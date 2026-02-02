import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MIME_TYPES: { [key: string]: string } = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments);

    // Security check: ensure the path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Get file stats for Last-Modified header
    const stats = await stat(filePath);

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Determine MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Last-Modified': stats.mtime.toUTCString(),
        // Cache for 1 year but allow revalidation
        'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
