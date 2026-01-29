import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';
import { invalidateMenuCache } from '@/lib/menuCache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      db.all(
        `SELECT * FROM menu_category_volumes 
        WHERE category_id = ?
        ORDER BY sort_order, volume`,
        [id],
        (err: any, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          const translatedVolumes = (rows || []).map((vol: any) => translateObject(vol));
          resolve(NextResponse.json({ volumes: translatedVolumes }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { volumes } = body;

    if (!Array.isArray(volumes)) {
      return NextResponse.json(
        { error: 'volumes must be an array' },
        { status: 400 }
      );
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      // Delete all existing volumes for this category
      db.run(
        'DELETE FROM menu_category_volumes WHERE category_id = ?',
        [id],
        (err: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          // Insert new volumes
          if (volumes.length === 0) {
            // Invalidate menu cache after clearing volumes
            invalidateMenuCache();
            resolve(NextResponse.json({ success: true, volumes: [] }));
            return;
          }

          const placeholders = volumes.map(() => '(?, ?, ?, ?)').join(', ');
          const values: any[] = [];
          volumes.forEach((vol: any) => {
            values.push(
              id,
              vol.volume,
              vol.is_default ? 1 : 0,
              vol.sort_order || 0
            );
          });

          db.run(
            `INSERT INTO menu_category_volumes (category_id, volume, is_default, sort_order) 
            VALUES ${placeholders}`,
            values,
            function (this: any, err: any) {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }
              // Invalidate menu cache after successful volume update
              invalidateMenuCache();
              resolve(NextResponse.json({ success: true, volumes }));
            }
          );
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

