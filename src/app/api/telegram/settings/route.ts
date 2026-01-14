import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise<NextResponse>((resolve) => {
    db.get(
      'SELECT * FROM telegram_bot_settings ORDER BY id DESC LIMIT 1',
      (err: Error | null, settings: any) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        // Return default settings if none exist
        if (!settings) {
          resolve(NextResponse.json({
            bot_id: '',
            api_token: '',
            is_enabled: false,
            reminder_interval_minutes: 3
          }));
          return;
        }

        // Don't expose full API token in response, only show last 4 characters
        const maskedToken = settings.api_token 
          ? `****${settings.api_token.slice(-4)}` 
          : '';

        resolve(NextResponse.json({
          id: settings.id,
          bot_id: settings.bot_id || '',
          api_token: maskedToken,
          full_api_token: settings.api_token || '', // For internal use
          is_enabled: settings.is_enabled === 1,
          reminder_interval_minutes: settings.reminder_interval_minutes || 3
        }));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { bot_id, api_token, is_enabled, reminder_interval_minutes } = await request.json();

    if (!api_token) {
      return NextResponse.json(
        { error: 'API Token is required' },
        { status: 400 }
      );
    }

    // Validate token and get bot_id if not provided
    let finalBotId = bot_id;
    if (!finalBotId || finalBotId.trim() === '') {
      try {
        const TelegramBot = (await import('node-telegram-bot-api')).default;
        const testBot = new TelegramBot(api_token, { polling: false });
        const botInfo = await testBot.getMe();
        finalBotId = botInfo.id.toString();
      } catch (error: any) {
        return NextResponse.json(
          { error: `Invalid API token: ${error.message}. Please check your token from @BotFather.` },
          { status: 400 }
        );
      }
    }

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      // Check if settings exist
      db.get(
        'SELECT id FROM telegram_bot_settings ORDER BY id DESC LIMIT 1',
        (err: Error | null, existing: any) => {
          if (err) {
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          if (existing) {
            // Update existing settings
            db.run(
              `UPDATE telegram_bot_settings 
               SET bot_id = ?, api_token = ?, is_enabled = ?, reminder_interval_minutes = ?, updated_at = NOW()
               WHERE id = ?`,
              [finalBotId, api_token, is_enabled ? 1 : 0, reminder_interval_minutes || 3, existing.id],
              function(updateErr: Error | null) {
                if (updateErr) {
                  resolve(NextResponse.json({ error: 'Failed to update settings' }, { status: 500 }));
                  return;
                }
                resolve(NextResponse.json({ success: true, message: 'Settings updated successfully' }));
              }
            );
          } else {
            // Insert new settings
            db.run(
              `INSERT INTO telegram_bot_settings (bot_id, api_token, is_enabled, reminder_interval_minutes, created_at, updated_at)
               VALUES (?, ?, ?, ?, NOW(), NOW())`,
              [finalBotId, api_token, is_enabled ? 1 : 0, reminder_interval_minutes || 3],
              function(insertErr: Error | null) {
                if (insertErr) {
                  resolve(NextResponse.json({ error: 'Failed to save settings' }, { status: 500 }));
                  return;
                }
                resolve(NextResponse.json({ success: true, message: 'Settings saved successfully' }));
              }
            );
          }
        }
      );
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

