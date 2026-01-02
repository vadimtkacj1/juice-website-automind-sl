import { NextRequest, NextResponse } from 'next/server';

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
      db.get('SELECT * FROM locations WHERE id = ?', [id], (err: Error | null, row: any) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        if (!row) {
          resolve(
            NextResponse.json({ message: 'Location not found' }, { status: 404 })
          );
          return;
        }
        resolve(NextResponse.json({ location: row }));
      });
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
    const { country, city, address, hours, phone, email, image, map_url, show_map_button, is_active, sort_order } = body;

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `UPDATE locations SET 
          country = ?, city = ?, address = ?, hours = ?, phone = ?, 
          email = ?, image = ?, map_url = ?, show_map_button = ?, is_active = ?, sort_order = ? 
        WHERE id = ?`,
        [country, city, address, hours || '', phone || '', email || '', image || '', map_url || '', show_map_button !== false ? 1 : 0, is_active ? 1 : 0, sort_order || 0, id],
        function (this: any, err: Error | null) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (this.changes === 0) {
            resolve(
              NextResponse.json({ message: 'Location not found' }, { status: 404 })
            );
            return;
          }
          resolve(NextResponse.json({ message: 'Location updated successfully' }));
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

export async function DELETE(
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
      db.run('DELETE FROM locations WHERE id = ?', [id], function (this: any, err: Error | null) {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        if (this.changes === 0) {
          resolve(
            NextResponse.json({ message: 'Location not found' }, { status: 404 })
          );
          return;
        }
        resolve(NextResponse.json({ message: 'Location deleted successfully' }));
      });
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
