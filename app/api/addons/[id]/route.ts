import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util'; // Импортируем promisify
const getDatabase = require('@/lib/database');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Исправлен тип params
) {
  try {
    const { id } = params;
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const dbGet = promisify(db.get).bind(db); // Промисифицируем db.get

    try {
      const row = await dbGet('SELECT * FROM addons WHERE id = ?', [id]);
      if (!row) {
        return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
      }
      return NextResponse.json({ addon: row });
    } catch (err: any) {
      console.error('Database error (GET):', err); // Уточнен лог
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API error (GET):', error); // Уточнен лог
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // Исправлен тип params
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, price, image, is_available, sort_order } = body;

    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Пользовательская обертка для db.run, чтобы получить this.changes
    const runWithChanges = (sql: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(this: any, err: any) {
          if (err) {
            return reject(err);
          }
          resolve(this.changes); // Разрешаем с количеством изменений
        });
      });
    };

    try {
      const changes = await runWithChanges(
        `UPDATE addons
        SET name = ?, description = ?, price = ?, image = ?, is_available = ?, sort_order = ?
        WHERE id = ?`,
        [
          name,
          description || null,
          price,
          image || null,
          is_available !== false ? 1 : 0,
          sort_order || 0,
          id
        ]
      );

      if (changes === 0) {
        return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
      }
      return NextResponse.json({
        id: parseInt(id),
        name, description, price, image, is_available, sort_order
      });
    } catch (err: any) {
      console.error('Database error (PUT):', err); // Уточнен лог
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API error (PUT):', error); // Уточнен лог
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Исправлен тип params
) {
  try {
    const { id } = params;
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Пользовательская обертка для db.run, чтобы получить this.changes
    const runWithChanges = (sql: string, params: any[]) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function(this: any, err: any) {
            if (err) {
              return reject(err);
            }
            resolve(this.changes);
          });
        });
    };

    try {
      const changes = await runWithChanges('DELETE FROM addons WHERE id = ?', [id]);
      if (changes === 0) {
        return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error('Database error (DELETE):', err); // Уточнен лог
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API error (DELETE):', error); // Уточнен лог
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
