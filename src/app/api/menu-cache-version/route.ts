import { NextResponse } from 'next/server';
import { getCacheVersion } from '@/lib/menuCache';

// No caching for this endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Returns the current cache version timestamp
 * Used for cache busting on client side
 */
export async function GET() {
  return NextResponse.json(
    { version: getCacheVersion() },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
