import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotification } from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const success = await sendOrderNotification(orderId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Notification sent' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification. Check bot settings and couriers.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Notify order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

