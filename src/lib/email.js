const nodemailer = require('nodemailer');

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
 * Send order confirmation email to customer (Receipt)
 * @param {Object} orderData - Order information
 * @param {Buffer} [pdfAttachment] - Optional PDF receipt from PayPlus
 */
async function sendOrderConfirmationEmail(orderData, pdfAttachment = null) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[Email] Skipping email notification - not configured');
      return false;
    }

    // Format current date and time
    const orderDate = new Date();
    const formattedDate = orderDate.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate detailed items list with extras
    const generateItemHtml = (item) => {
      let html = `
        <div class="item">
          <div class="item-header">
            <strong>${item.name}</strong>
            <span class="item-price">₪${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="item-quantity">כמות: ${item.quantity}</div>
      `;

      // Add custom ingredients if present
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredientsList = item.customIngredients.map(ing =>
          `${ing.name} (+₪${ing.price.toFixed(2)})`
        ).join(', ');
        html += `<div class="item-extras">מרכיבים מותאמים: ${ingredientsList}</div>`;
      }

      // Add additional items if present
      if (item.additionalItems && item.additionalItems.length > 0) {
        const additionalList = item.additionalItems.map(add =>
          `${add.name} (+₪${add.price.toFixed(2)})`
        ).join(', ');
        html += `<div class="item-extras">תוספות: ${additionalList}</div>`;
      }

      html += `</div>`;
      return html;
    };

    const itemsList = orderData.items
      .map(item => {
        let text = `${item.name} x${item.quantity} - ₪${(item.price * item.quantity).toFixed(2)}`;
        if (item.customIngredients && item.customIngredients.length > 0) {
          const ingList = item.customIngredients.map(ing => `${ing.name} (+₪${ing.price.toFixed(2)})`).join(', ');
          text += `\n  מרכיבים מותאמים: ${ingList}`;
        }
        if (item.additionalItems && item.additionalItems.length > 0) {
          const addList = item.additionalItems.map(add => `${add.name} (+₪${add.price.toFixed(2)})`).join(', ');
          text += `\n  תוספות: ${addList}`;
        }
        return text;
      })
      .join('\n');

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Heebo, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .receipt-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; margin-top: 10px; font-size: 14px; }
          .content { padding: 30px 20px; }
          .order-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #4CAF50; }
          .order-info p { margin: 5px 0; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 5px; }
          .item { padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
          .item:last-child { border-bottom: none; }
          .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
          .item-header strong { font-size: 16px; }
          .item-price { color: #4CAF50; font-weight: bold; }
          .item-quantity { font-size: 14px; color: #666; margin: 5px 0; }
          .item-extras { font-size: 13px; color: #888; margin: 5px 0; padding-right: 15px; }
          .total-section { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
          .total-final { font-size: 1.4em; font-weight: bold; color: #4CAF50; border-top: 2px solid #4CAF50; padding-top: 15px; margin-top: 10px; }
          .payment-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .payment-info strong { color: #2e7d32; }
          .footer { text-align: center; padding: 30px 20px; background: #fafafa; border-top: 1px solid #e0e0e0; }
          .footer p { margin: 5px 0; color: #666; }
          .contact-info { margin-top: 20px; font-size: 14px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ קבלה - הזמנה שולמה בהצלחה</h1>
            <div class="receipt-badge">PAID RECEIPT</div>
          </div>
          <div class="content">
            <h2>שלום ${orderData.customerName},</h2>
            <p>תודה רבה על ההזמנה! התשלום התקבל בהצלחה והזמנתך נמצאת בטיפול.</p>

            <div class="order-info">
              <h3 style="margin-top: 0;">פרטי ההזמנה</h3>
              <p><strong>מספר הזמנה:</strong> ${orderData.orderNumber}</p>
              <p><strong>תאריך:</strong> ${formattedDate}</p>
              <p><strong>שעה:</strong> ${formattedTime}</p>
              ${orderData.deliveryAddress ? `<p><strong>כתובת למשלוח:</strong> ${orderData.deliveryAddress}</p>` : ''}
            </div>

            <div class="payment-info">
              <strong>✓ התשלום אושר והועבר בהצלחה</strong>
              <p>אמצעי תשלום: PayPlus</p>
            </div>

            <div class="order-details">
              <h3>פריטים שהוזמנו:</h3>
              ${orderData.items.map(item => generateItemHtml(item)).join('')}
            </div>

            <div class="total-section">
              <div class="total-row total-final">
                <span>סה"כ לתשלום:</span>
                <span>₪${orderData.total.toFixed(2)}</span>
              </div>
            </div>

            <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-right: 4px solid #ff9800;">
              📦 <strong>הזמנתך בדרך!</strong><br>
              נעדכן אותך בהמשך על סטטוס המשלוח. במידה ויש שאלות, נשמח לעזור!
            </p>
          </div>

          <div class="footer">
            <p><strong>תודה שבחרת בנו! 🥤</strong></p>
            <p>טבעי שזה מרענן - מיצים טבעיים טריים</p>
            <div class="contact-info">
              <p>זוהי קבלה אלקטרונית עבור הזמנתך</p>
              <p>אנא שמור אימייל זה לרישומך</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      קבלה - הזמנה שולמה בהצלחה
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

שלום ${orderData.customerName},

תודה רבה על ההזמנה! התשלום התקבל בהצלחה.

━━━ פרטי ההזמנה ━━━
מספר הזמנה: ${orderData.orderNumber}
תאריך: ${formattedDate}
שעה: ${formattedTime}
${orderData.deliveryAddress ? `כתובת למשלוח: ${orderData.deliveryAddress}` : ''}

━━━ סטטוס תשלום ━━━
✓ התשלום אושר והועבר בהצלחה
אמצעי תשלום: PayPlus

━━━ פריטים שהוזמנו ━━━
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
סה"כ לתשלום: ₪${orderData.total.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

הזמנתך בדרך! נעדכן אותך בהמשך על סטטוס המשלוח.

תודה שבחרת בנו!
טבעי שזה מרענן - מיצים טבעיים טריים

זוהי קבלה אלקטרונית עבור הזמנתך
אנא שמור אימייל זה לרישומך
    `;

    const emailFrom = process.env.EMAIL_SERVER_USER || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const emailFromName = process.env.EMAIL_FROM_NAME || 'טבעי שזה מרענן';

    // Prepare email options
    const mailOptions = {
      from: `"${emailFromName}" <${emailFrom}>`,
      to: orderData.customerEmail,
      subject: `🧾 קבלה - הזמנה ${orderData.orderNumber} שולמה בהצלחה`,
      text: emailText,
      html: emailHtml,
      attachments: []
    };

    // Add PDF attachment if provided
    if (pdfAttachment && Buffer.isBuffer(pdfAttachment)) {
      mailOptions.attachments.push({
        filename: `receipt-${orderData.orderNumber}.pdf`,
        content: pdfAttachment,
        contentType: 'application/pdf'
      });
      console.log('[Email] 📎 PDF receipt attached to email');
    }

    await transporter.sendMail(mailOptions);

    console.log(`[Email] ✅ Order receipt sent to ${orderData.customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Failed to send order receipt:', error);
    return false;
  }
}

/**
 * Send order notification email to admin/store
 */
async function sendAdminOrderNotification(orderData) {
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
    const emailFromName = process.env.EMAIL_FROM_NAME || 'טבעי שזה מרענן';

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

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
};
