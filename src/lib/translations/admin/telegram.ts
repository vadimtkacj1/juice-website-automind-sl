/**
 * Telegram delivery management translations
 */
export const telegramTranslations: Record<string, string> = {
  // Page Header
  'Telegram Delivery Management': 'ניהול משלוח טלגרם',
  'Configure Telegram bot integration and manage couriers': 'הגדר אינטגרציה עם בוט טלגרם ונהל שליחים',

  // Stats
  'Bot Status': 'סטטוס בוט',
  'Active Couriers': 'שליחים פעילים',
  'System Status': 'סטטוס מערכת',
  'Ready': 'מוכן',
  'Not Ready': 'לא מוכן',

  // Actions
  'Diagnose': 'אבחון',
  'Test Order': 'הזמנת בדיקה',

  // Bot Settings
  'Bot Settings': 'הגדרות בוט',
  'Configure Telegram bot integration': 'הגדר אינטגרציה עם בוט טלגרם',
  'Configure': 'הגדר',
  'Bot ID': 'מזהה בוט',
  'Not configured': 'לא הוגדר',
  'API Token': 'טוקן API',
  'Reminder Interval': 'מרווח תזכורות',
  'min.': 'דק\'',

  // Bot Settings Dialog
  'Configure your Telegram bot for order notifications': 'הגדר את בוט הטלגרם שלך להתראות הזמנה',
  'Get this from @BotFather in Telegram. Type /newbot to create a bot.': 'קבל זאת מ-@BotFather בטלגרם. הקלד /newbot ליצירת בוט.',
  'Auto-filled from token': 'יועלה אוטומטית מהטוקן',
  'Automatically extracted from API token': 'מופק אוטומטית מטוקן ה-API',
  'Reminder Interval (minutes)': 'מרווח תזכורות (דקות)',
  'How often to send reminders (default: 5 minutes)': 'באיזו תדירות לשלוח תזכורות (ברירת מחדל: 5 דקות)',
  'Enable Bot': 'הפעל בוט',
  'Save Settings': 'שמור הגדרות',

  // Couriers
  'Delivery Accounts': 'חשבונות משלוח',
  'Manage the list of couriers who receive order notifications': 'נהל את רשימת השליחים שמקבלים התראות הזמנה',
  'Add Courier': 'הוסף שליח',
  'No couriers yet': 'אין שליחים עדיין',
  'Click "Add Courier" to get started': 'לחץ "הוסף שליח" כדי להתחיל',
  'Kitchen': 'מטבח',
  'Delivery': 'משלוח',
  'Observer': 'צופה',

  // Courier Dialog
  'Edit Courier': 'ערוך שליח',
  'Update courier information': 'עדכן מידע שליח',
  'Add a new courier to receive order notifications': 'הוסף שליח חדש לקבלת התראות הזמנה',
  'Telegram ID': 'מזהה טלגרם',
  'Find your Telegram ID using @userinfobot': 'מצא את מזהה הטלגרם שלך באמצעות @userinfobot',
  'John Doe': 'ישראל ישראלי',
  'Role': 'תפקיד',
  'Delivery (with action buttons)': 'משלוח (עם כפתורי פעולה)',
  'Kitchen (info only)': 'מטבח (מידע בלבד)',
  'Observer (summary only)': 'צופה (סיכום בלבד)',
  'Receives orders with "Accept" and "Delivered" buttons, gets reminders': 'מקבל הזמנות עם כפתורי "קבל" ו"נמסר", מקבל תזכורות',
  'Receives order info without action buttons, gets reminders': 'מקבל מידע הזמנה ללא כפתורי פעולה, מקבל תזכורות',
  'Receives order summary only, no reminders': 'מקבל סיכום הזמנה בלבד, ללא תזכורות',

  // Alerts
  'Invalid Token': 'טוקן לא חוקי',
  'The API token is invalid. Please check your token from @BotFather.\n\nTo get a token:\n1. Open Telegram\n2. Search for @BotFather\n3. Type /newbot\n4. Follow instructions\n5. Copy the token (format: 123456789:ABCdef...)':
    'טוקן ה-API אינו חוקי. אנא בדוק את הטוקן שלך מ-@BotFather.\n\nכדי לקבל טוקן:\n1. פתח את טלגרם\n2. חפש את @BotFather\n3. הקלד /newbot\n4. עקוב אחר ההוראות\n5. העתק את הטוקן (פורמט: 123456789:ABCdef...)',
  'Settings saved successfully! Bot will be initialized in the background.': 'הגדרות נשמרו בהצלחה! הבוט יאותחל ברקע.',
  'Failed to save settings': 'שמירת הגדרות נכשלה',
  'Failed to validate token. Please check your API token.': 'אימות הטוקן נכשל. אנא בדוק את טוקן ה-API שלך.',
  'Test Order Created': 'הזמנת בדיקה נוצרה',
  'Test order #': 'הזמנת בדיקה מס\' ',
  ' created successfully! Check your Telegram bot - all active couriers should receive a notification.': ' נוצרה בהצלחה! בדוק את בוט הטלגרם שלך - כל השליחים הפעילים אמורים לקבל התראה.',
  'Failed to create test order': 'יצירת הזמנת בדיקה נכשלה',
  'Diagnostics:': 'אבחון:',
  'Bot Configured': 'בוט הוגדר',
  'Bot Enabled': 'בוט מופעל',
  'Token Valid': 'טוקן תקין',
  'Bot Instance Ready': 'מופע בוט מוכן',
  'Errors': 'שגיאות',
  'System Status: Ready': 'סטטוס מערכת: מוכן',
  'System Status: Not Ready': 'סטטוס מערכת: לא מוכן',
  'Diagnostic Error': 'שגיאת אבחון',
  'Failed to run diagnostics': 'הרצת אבחון נכשלה',
  'Courier updated successfully!': 'שליח עודכן בהצלחה!',
  'Courier created successfully!': 'שליח נוצר בהצלחה!',
  'Failed to save courier': 'שמירת שליח נכשלה',
  'Courier deleted successfully!': 'שליח נמחק בהצלחה!',
  'Failed to delete courier': 'מחיקת שליח נכשלה',
};
