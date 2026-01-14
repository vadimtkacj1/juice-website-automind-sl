import { NextRequest, NextResponse } from 'next/server';
import { getBotInstance } from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
  // Check if standalone service is available
  try {
    const serviceUrl = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3001';
    const healthCheck = await fetch(`${serviceUrl}/health`, {
      signal: AbortSignal.timeout(1000)
    });
    
    if (healthCheck.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Standalone Telegram service is running. Bot is handled by the service, no need to initialize in main app.' 
      });
    }
  } catch {
    // Service not available, continue with direct initialization
  }

  // Run asynchronously to not block the request
  setImmediate(async () => {
    try {
      // Initialize bot with polling enabled (only if service not available)
      const bot = await getBotInstance(true);

      if (!bot) {
        console.error('[Telegram Setup] Bot is not configured or enabled. Please check your API token.');
        return;
      }

      console.log('[Telegram Setup] Bot initialized successfully');
    } catch (error: any) {
      console.error('[Telegram Setup] Error:', error.message);
    }
  });

  // Return immediately without waiting
  return NextResponse.json({ 
    success: true, 
    message: 'Bot initialization started. Check server logs for status.' 
  });
}

