import { NextRequest, NextResponse } from 'next/server';
import { getBotInstance } from '@/lib/telegram-bot';

// This endpoint can be used to set up webhook or initialize polling
// For webhook setup, you would configure Telegram to send updates to this endpoint
export async function POST(request: NextRequest) {
  try {
    // Initialize bot with polling (simpler than webhook for most cases)
    const bot = await getBotInstance(true);

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot is not configured or enabled' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bot webhook/polling initialized' 
    });
  } catch (error: any) {
    console.error('Webhook setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup webhook' },
      { status: 500 }
    );
  }
}

// Handle incoming webhook updates (if using webhook instead of polling)
export async function GET(request: NextRequest) {
  // This can be used to verify webhook setup
  return NextResponse.json({ status: 'ok' });
}

