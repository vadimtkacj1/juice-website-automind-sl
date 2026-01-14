import { NextRequest, NextResponse } from 'next/server';

interface ReorderEntry {
  id: number;
  category_id: number;
  sort_order: number;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { order } = body || {};

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Payload must include an array "order".' },
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

    await Promise.all(
      order.map((entry: ReorderEntry, index: number) => {
        const sortOrder = Number.isFinite(entry?.sort_order) ? entry.sort_order : index;
        return new Promise<void>((resolve, reject) => {
          db.run(
            `UPDATE menu_items 
             SET category_id = ?, sort_order = ? 
             WHERE id = ?`,
            [entry.category_id, sortOrder, entry.id],
            (err: any) => {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            }
          );
        });
      })
    );

    return NextResponse.json({ success: true, updated: order.length });
  } catch (error: any) {
    console.error('Error reordering menu items:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

