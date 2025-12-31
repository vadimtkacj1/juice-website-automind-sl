import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

export async function POST(request: NextRequest) {
  try {
    const { api_token } = await request.json();

    if (!api_token) {
      return NextResponse.json(
        { error: 'API token is required' },
        { status: 400 }
      );
    }

    // Validate token by making a test API call
    try {
      const testBot = new TelegramBot(api_token, { polling: false });
      const botInfo = await testBot.getMe();
      
      return NextResponse.json({
        success: true,
        valid: true,
        bot_id: botInfo.id.toString(),
        bot_username: botInfo.username,
        message: 'Token is valid'
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: error.message || 'Invalid token',
        message: 'Token validation failed. Please check your API token.'
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

