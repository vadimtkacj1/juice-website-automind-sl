import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';

interface CartAddon {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: CartAddon[];
  customIngredients?: Array<{ id: number; name: string; price: number }>; // Array of ingredient objects with name
}

interface CustomerInfo {
  phone: string;
  email: string;
  name?: string;
  deliveryAddress?: string;
}

// Helper to save order to database
async function saveOrder(items: CartItem[], customer: CustomerInfo): Promise<{
  orderId: number;
  orderNumber: string;
  total: number;
}> {
  return new Promise((resolve, reject) => {
    // Calculate total including addons and custom ingredients
    const total = items.reduce((sum, item) => {
      const itemPrice = item.price * item.quantity;
      const addonsPrice = (item.addons || []).reduce((addonTotal, addon) => 
        addonTotal + addon.price * addon.quantity * item.quantity, 0
      );
      const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal, ing) => 
        ingTotal + ing.price * item.quantity, 0
      );
      return sum + itemPrice + addonsPrice + ingredientsPrice;
    }, 0);
    
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Build notes with addon and ingredient information
    const notesParts = [`Order: ${orderNumber}`];
    items.forEach((item, idx) => {
      if (item.addons && item.addons.length > 0) {
        const addonsList = item.addons.map(a => `${a.name} (x${a.quantity})`).join(', ');
        notesParts.push(`Item ${idx + 1} addons: ${addonsList}`);
      }
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredientsList = item.customIngredients.map(ing => ing.name).join(', ');
        notesParts.push(`Item ${idx + 1} custom ingredients: ${ingredientsList}`);
      }
    });
    const notes = notesParts.join(' | ');
    
    db.run(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [customer.name || 'Customer', customer.email, customer.phone, customer.deliveryAddress || null, total, 'pending', null, notes],
      function(err: any) {
        if (err) {
          reject(err);
          return;
        }
        
        const orderId = this.lastID;
        
        // Insert order items
        const insertItem = (index: number) => {
          if (index >= items.length) {
            resolve({ orderId, orderNumber, total });
            return;
          }
          
          const item = items[index];
          // Calculate item price including addons and ingredients
          const addonsPrice = (item.addons || []).reduce((addonTotal, addon) => 
            addonTotal + addon.price * addon.quantity, 0
          );
          const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal, ing) => 
            ingTotal + ing.price, 0
          );
          const itemTotalPrice = item.price + addonsPrice + ingredientsPrice;
          
          // Build item name with addons and ingredients info
          let itemName = item.name;
          if (item.addons && item.addons.length > 0) {
            const addonsList = item.addons.map(a => `+${a.name}${a.quantity > 1 ? `(x${a.quantity})` : ''}`).join(' ');
            itemName += ` [${addonsList}]`;
          }
          if (item.customIngredients && item.customIngredients.length > 0) {
            const ingredientsList = item.customIngredients.map(ing => ing.name).join(', ');
            itemName += ` [Ingredients: ${ingredientsList}]`;
          }
          
          db.run(
            `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.id, itemName, item.quantity, itemTotalPrice],
            (itemErr: any) => {
              if (itemErr) {
                console.error('Error inserting order item:', itemErr);
              }
              insertItem(index + 1);
            }
          );
        };
        
        insertItem(0);
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!customer || !customer.phone || !customer.email) {
      return NextResponse.json(
        { error: 'Phone and email are required' },
        { status: 400 }
      );
    }

    // Save order to database
    try {
      const orderData = await saveOrder(items, customer);
      
      // Send Telegram notification via service (non-blocking)
      fetch('/api/telegram/notify-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.orderId }),
      }).catch(() => {
        // Ignore errors - notification is non-critical
      });
      
      return NextResponse.json({
        success: true,
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        total: orderData.total,
        redirectUrl: `/checkout/success?order=${orderData.orderNumber}`
      });
    } catch (error: any) {
      console.error('Error saving order:', error);
      return NextResponse.json(
        { error: 'Failed to save order. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
