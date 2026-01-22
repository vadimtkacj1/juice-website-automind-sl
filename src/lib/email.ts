import nodemailer from 'nodemailer';

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryAddress?: string;
}

/**
 * Create email transporter
 */
function createTransporter() {
  // Check if email configuration exists (support both naming conventions)
  const emailHost = process.env.EMAIL_SERVER_HOST || process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_SERVER_PORT || process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASSWORD;
  const emailSecure = process.env.EMAIL_SERVER_SECURE || process.env.EMAIL_SECURE;

  if (!emailHost || !emailUser || !emailPassword) {
    console.warn('[Email] Email configuration not found. Email notifications will be disabled.');
    console.warn('[Email] Required: EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort || '587'),
    secure: emailSecure === 'true', // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[Email] Skipping email notification - not configured');
      return false;
    }

    const itemsList = orderData.items
      .map(item => `${item.name} x${item.quantity} - ₪${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Heebo, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 1.2em; font-weight: bold; color: #4CAF50; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ הזמנה התקבלה בהצלחה!</h1>
          </div>
          <div class="content">
            <h2>שלום ${orderData.customerName},</h2>
            <p>תודה על ההזמנה שלך! הזמנתך התקבלה ונמצאת בטיפול.</p>
            
            <div class="order-details">
              <h3>פרטי ההזמנה</h3>
              <p><strong>מספר הזמנה:</strong> ${orderData.orderNumber}</p>
              ${orderData.deliveryAddress ? `<p><strong>כתובת למשלוח:</strong> ${orderData.deliveryAddress}</p>` : ''}
              
              <h4>פריטים:</h4>
              <div>
                ${orderData.items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong> x${item.quantity} - ₪${(item.price * item.quantity).toFixed(2)}
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                <p>סה"כ: ₪${orderData.total.toFixed(2)}</p>
              </div>
            </div>
            
            <p>נעדכן אותך בהמשך על סטטוס ההזמנה.</p>
            <p>במידה ויש שאלות, אנא צור איתנו קשר.</p>
          </div>
          
          <div class="footer">
            <p>תודה שבחרת בנו! 🥤</p>
            <p>נטורליי מרענן - מיצים טבעיים טריים</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
הזמנה התקבלה בהצלחה!

שלום ${orderData.customerName},

תודה על ההזמנה שלך!

מספר הזמנה: ${orderData.orderNumber}
${orderData.deliveryAddress ? `כתובת למשלוח: ${orderData.deliveryAddress}` : ''}

פריטים:
${itemsList}

סה"כ: ₪${orderData.total.toFixed(2)}

נעדכן אותך בהמשך על סטטוס ההזמנה.

תודה שבחרת בנו!
נטורליי מרענן - מיצים טבעיים טריים
    `;

    const emailFrom = process.env.EMAIL_SERVER_USER || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const emailFromName = process.env.EMAIL_FROM_NAME || 'נטורליי מרענן';

    await transporter.sendMail({
      from: `"${emailFromName}" <${emailFrom}>`,
      to: orderData.customerEmail,
      subject: `✅ הזמנה ${orderData.orderNumber} התקבלה`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`[Email] ✅ Order confirmation email sent to ${orderData.customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Failed to send order confirmation email:', error);
    return false;
  }
}

/**
 * Send order notification email to admin/store
 */
export async function sendAdminOrderNotification(orderData: OrderEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[Email] Skipping admin email notification - not configured');
      return false;
    }

    const adminEmail = process.env.EMAIL_ADMIN || process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('[Email] Admin email not configured');
      return false;
    }

    const itemsList = orderData.items
      .map(item => `${item.name} x${item.quantity} - ₪${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Heebo, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 1.2em; font-weight: bold; color: #FF9800; margin-top: 15px; }
          .customer-info { background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #FF9800; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 הזמנה חדשה!</h1>
          </div>
          <div class="content">
            <h2>התקבלה הזמנה חדשה</h2>
            
            <div class="customer-info">
              <h3>פרטי הלקוח</h3>
              <p><strong>שם:</strong> ${orderData.customerName}</p>
              <p><strong>אימייל:</strong> ${orderData.customerEmail}</p>
              ${orderData.deliveryAddress ? `<p><strong>כתובת למשלוח:</strong> ${orderData.deliveryAddress}</p>` : ''}
            </div>
            
            <div class="order-details">
              <h3>פרטי ההזמנה</h3>
              <p><strong>מספר הזמנה:</strong> ${orderData.orderNumber}</p>
              
              <h4>פריטים:</h4>
              <div>
                ${orderData.items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong> x${item.quantity} - ₪${(item.price * item.quantity).toFixed(2)}
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                <p>סה"כ: ₪${orderData.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailFrom = process.env.EMAIL_SERVER_USER || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const emailFromName = process.env.EMAIL_FROM_NAME || 'נטורליי מרענן';

    await transporter.sendMail({
      from: `"${emailFromName}" <${emailFrom}>`,
      to: adminEmail,
      subject: `🔔 הזמנה חדשה ${orderData.orderNumber}`,
      html: emailHtml,
    });

    console.log(`[Email] ✅ Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Failed to send admin notification email:', error);
    return false;
  }
}
