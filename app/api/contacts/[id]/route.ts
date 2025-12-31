import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const dbGet = (query: string, params: any[] = []) => {
      return new Promise<any>((resolve, reject) => {
        db.get(query, params, (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    try {
      const row = await dbGet('SELECT * FROM contacts WHERE id = ?', [id]);
      if (!row) {
        return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
      }
      return NextResponse.json({ contact: row });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { type, value } = body;

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const dbRun = (query: string, params: any[] = []) => {
      return new Promise<any>((resolve, reject) => {
        db.run(query, params, function(err: Error | null) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };

    try {
      const runResult = await dbRun(
        'UPDATE contacts SET type = ?, value = ? WHERE id = ?',
        [type, value, id]
      );

      if (runResult.changes === 0) {
        return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Contact updated successfully' });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    try {
      const runResult = await dbRun('DELETE FROM contacts WHERE id = ?', [id]);
      if (runResult.changes === 0) {
        return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Contact deleted successfully' });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
