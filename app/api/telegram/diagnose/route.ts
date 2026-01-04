import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getBotInstance } from '@/lib/telegram-bot';
import TelegramBot from 'node-telegram-bot-api';

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisify db.all for async/await
const dbAll = (db: any, query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    bot_configured: false,
    bot_enabled: false,
    bot_token_valid: false,
    active_couriers: 0,
    errors: []
  };

  try {
    const db = getDatabase();

    // Check bot settings
    try {
      const settings = await dbGet(db, 'SELECT * FROM telegram_bot_settings ORDER BY id DESC LIMIT 1');
      
      if (!settings) {
        diagnostics.errors.push('No bot settings found. Please configure bot in admin panel.');
        return NextResponse.json(diagnostics);
      }

      diagnostics.bot_configured = true;
      diagnostics.bot_enabled = settings.is_enabled === 1;
      diagnostics.bot_id = settings.bot_id;
      diagnostics.has_token = !!settings.api_token;

      if (!settings.is_enabled) {
        diagnostics.errors.push('Bot is disabled. Enable it in admin panel.');
        return NextResponse.json(diagnostics);
      }

      if (!settings.api_token) {
        diagnostics.errors.push('API token is missing. Please configure bot token.');
        return NextResponse.json(diagnostics);
      }

      // Validate token
      try {
        const testBot = new TelegramBot(settings.api_token, { polling: false });
        const botInfo = await testBot.getMe();
        diagnostics.bot_token_valid = true;
        diagnostics.bot_username = botInfo.username;
        diagnostics.bot_name = botInfo.first_name;
      } catch (tokenError: any) {
        diagnostics.errors.push(`Invalid API token: ${tokenError.message}`);
        diagnostics.bot_token_valid = false;
      }

      // Check active couriers
      let couriers: any[] = [];
      try {
        couriers = await dbAll(db, 'SELECT * FROM telegram_couriers WHERE is_active = 1');
        diagnostics.active_couriers = couriers?.length || 0;
        diagnostics.couriers = couriers?.map((c: any) => ({
          id: c.id,
          telegram_id: c.telegram_id,
          name: c.name
        })) || [];

        if (diagnostics.active_couriers === 0) {
          diagnostics.errors.push('No active couriers found. Add couriers in admin panel.');
        }
      } catch (courierErr: any) {
        diagnostics.errors.push(`Error fetching couriers: ${courierErr.message}`);
      }

      // Check if bot instance is initialized and test sending
      const bot = await getBotInstance();
      diagnostics.bot_instance_ready = bot !== null;
      
      // Test if bot can send messages to couriers
      if (bot && diagnostics.bot_token_valid && couriers && couriers.length > 0) {
        diagnostics.courier_tests = [];
        for (const courier of couriers) {
          try {
            // Try to send a test message (we'll delete it immediately)
            const testMsg = await bot.sendMessage(
              courier.telegram_id,
              '🔍 Test message - checking if bot can reach you. This is just a test, you can ignore it.',
              { parse_mode: 'HTML' }
            );
            diagnostics.courier_tests.push({
              courier_id: courier.telegram_id,
              courier_name: courier.name,
              status: 'reachable',
              message_id: testMsg.message_id
            });
            // Try to delete the test message
            try {
              await bot.deleteMessage(courier.telegram_id, testMsg.message_id);
            } catch {
              // Ignore delete errors
            }
          } catch (error: any) {
            diagnostics.courier_tests.push({
              courier_id: courier.telegram_id,
              courier_name: courier.name,
              status: 'unreachable',
              error: error.message,
              hint: error.message?.includes('chat not found') || error.message?.includes('bot was blocked')
                ? 'Courier needs to start a chat with the bot first (/start)'
                : 'Unknown error'
            });
          }
        }
      }
      
      diagnostics.status = diagnostics.bot_token_valid && 
                           diagnostics.bot_enabled && 
                           diagnostics.active_couriers > 0 &&
                           diagnostics.bot_instance_ready
                           ? 'ready' : 'not_ready';
      
      return NextResponse.json(diagnostics);
    } catch (err: any) {
      diagnostics.errors.push(`Database error: ${err.message}`);
      return NextResponse.json(diagnostics);
    }
  } catch (error: any) {
    diagnostics.errors.push(`Unexpected error: ${error.message}`);
    return NextResponse.json(diagnostics);
  }
}

