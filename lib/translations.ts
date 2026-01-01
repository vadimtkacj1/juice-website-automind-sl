/**
 * Translation utility to convert English text to Hebrew
 * This function translates English text to Hebrew
 */

// Common English to Hebrew translations
const hebrewTranslations: Record<string, string> = {
  // Common words and phrases - English to Hebrew
  'home': 'בית',
  'menu': 'תפריט',
  'locations': 'מיקומים',
  'contact': 'צור קשר',
  'cart': 'עגלה',
  'shopping cart': 'סל קניות',
  'your cart': 'עגלת הקניות שלך',
  'add to cart': 'הוסף לעגלה',
  'total': 'סה"כ',
  'price': 'מחיר',
  'quantity': 'כמות',
  'remove': 'הסר',
  'update': 'עדכן',
  'save': 'שמור',
  'cancel': 'ביטול',
  'confirm': 'אישור',
  'delete': 'מחק',
  'edit': 'ערוך',
  'add': 'הוסף',
  'name': 'שם',
  'description': 'תיאור',
  'image': 'תמונה',
  'available': 'זמין',
  'unavailable': 'לא זמין',
  'yes': 'כן',
  'no': 'לא',
  'error': 'שגיאה',
  'success': 'הצלחה',
  'warning': 'אזהרה',
  'info': 'מידע',
  'loading': 'טעינה',
  'send': 'שליחה',
  'message': 'הודעה',
  'email': 'אימייל',
  'phone': 'טלפון',
  'address': 'כתובת',
  'business hours': 'שעות פעילות',
  'morning': 'בוקר',
  'noon': 'צהריים',
  'evening': 'ערב',
  'sunday': 'יום ראשון',
  'monday': 'יום שני',
  'tuesday': 'יום שלישי',
  'wednesday': 'יום רביעי',
  'thursday': 'יום חמישי',
  'friday': 'יום שישי',
  'saturday': 'שבת',
  'ordering': 'מזמינים',
  'order': 'הזמנה',
  'order number': 'מספר הזמנה',
  'order confirmed': 'הזמנה אושרה',
  'thank you for your order': 'תודה על ההזמנה',
  'new order': 'הזמנה חדשה',
  'pending': 'ממתין',
  'processing': 'מעבד',
  'completed': 'הושלם',
  'cancelled': 'בוטל',
  'product': 'מוצר',
  'products': 'מוצרים',
  'category': 'קטגוריה',
  'categories': 'קטגוריות',
  'add-ons': 'תוספות',
  'ingredients': 'מרכיבים',
  'fruits': 'פירות',
  'boosters': 'בוסטרים',
  'toppings': 'תוספות',
  'volume': 'נפח',
  'size': 'גודל',
  'small': 'קטן',
  'medium': 'בינוני',
  'large': 'גדול',
  'sale': 'מבצע',
  'discount': 'הנחה',
  'discount percent': 'אחוז הנחה',
  'original price': 'מחיר מקורי',
  'discounted price': 'מחיר מוזל',
  'news': 'חדשות',
  'title': 'כותרת',
  'content': 'תוכן',
  'date': 'תאריך',
  'created': 'נוצר',
  'updated': 'עודכן',
  'admin': 'מנהל',
  'dashboard': 'לוח בקרה',
  'login': 'התחברות',
  'logout': 'התנתקות',
  'password': 'סיסמה',
  'username': 'שם משתמש',
  'contact us': 'צור קשר',
  'send message': 'שלח הודעה',
  'subject': 'נושא',
  'your message': 'הודעה שלך',
  'message sent': 'הודעה נשלחה',
  "we'll get back to you soon": 'נחזור אליך בקרוב',
  'location': 'מיקום',
  'opening hours': 'שעות פתיחה',
  'closed': 'סגור',
  'open': 'פתוח',
  'between': 'בין השעות',
  'until': 'עד',
  'from': 'מ',
  'at': 'ב',
  'select': 'בחר',
  'select volume': 'בחר נפח',
  'add ingredients': 'הוסף מרכיבים',
  'choose additional ingredients': 'בחר מרכיבים נוספים',
  'select add-ons': 'בחר תוספות',
  'cart is empty': 'עגלה ריקה',
  'add items from the menu': 'הוסף פריטים מהתפריט',
  'browse menu': 'עיין בתפריט',
  'continue to checkout': 'המשך לתשלום',
  'contact details': 'פרטי קשר',
  'please provide your contact details': 'אנא ספק את פרטי הקשר שלך',
  'phone number': 'מספר טלפון',
  'email address': 'כתובת אימייל',
  'delivery address': 'כתובת משלוח',
  'place order': 'הזמן הזמנה',
  'order summary': 'סיכום הזמנה',
  'with': 'עם',
  'without': 'בלי',
  'required': 'נדרש',
  'optional': 'אופציונלי',
  'valid': 'תקף',
  'invalid': 'לא תקין',
  'phone number is required': 'נדרש מספר טלפון',
  'please enter a valid phone number': 'אנא הזן מספר טלפון תקין',
  'email is required': 'נדרש אימייל',
  'please enter a valid email': 'אנא הזן אימייל תקין',
  'failed to start checkout': 'נכשל להתחיל תשלום',
  'please try again': 'נסה שוב',
  'try again': 'נסה שוב',
  'loading delicious menu': 'טוען תפריט טעים',
  'failed to load menu': 'נכשל לטעון תפריט',
  'menu is empty': 'תפריט ריק',
  'delicious items coming soon': 'פריטים טעימים יגיעו בקרוב',
  'loading more items': 'טוען פריטים נוספים',
  'our menu': 'התפריט שלנו',
  'who we are': 'מי אנחנו',
  'what we do': 'מה אנחנו עושים',
  'our values': 'הערכים שלנו',
  'visit us': 'בואו לבקר אותנו',
  'find us at multiple locations': 'מצא אותנו במיקומים מרובים',
  'fresh juices and smoothies await you': 'מיצים טריים וסמוזים מחכים לך',
  'view all locations': 'צפה בכל המיקומים',
  "thank you for your order. we've received your order": "תודה על ההזמנה שלך. קיבלנו את ההזמנה שלך",
  "and will start preparing your items right away": 'נתחיל להכין את הפריטים שלך מיד',
  "you will receive a confirmation email shortly": 'תקבל אימייל אישור בקרוב',
  'back to home': 'חזרה לבית',
  'order more': 'הזמן עוד',
  'add ingredients?': 'הוסף מרכיבים',
  'would you like to add these ingredients to this juice?': 'האם תרצה להוסיף את המרכיבים האלה למיץ הזה',
  'no, skip': 'לא, דלג',
  'yes, add all': 'כן, הוסף הכל',
  'choose one': 'בחר אחד',
  'sending': 'שולח',
  'have a question or feedback? we\'d love to hear from you!': 'יש לך שאלה או משוב? נשמח לשמוע ממך',
  'your name': 'השם שלך',
  'how can we help?': 'איך נוכל לעזור',
  "tell us what you're thinking...": 'ספר לנו מה אתה חושב',
  'our locations': 'המיקומים שלנו',
  'find us at a location near you!': 'מצא אותנו במיקום קרוב אליך',
  'loading locations...': 'טוען מיקומים',
  'view on map': 'צפה במפה',
  'experience the perfect blend of quality and taste. made with care using only the finest natural ingredients to bring you an exceptional experience.': 'חוויה מושלמת של איכות וטעם. עשוי בקפידה תוך שימוש רק במרכיבים הטבעיים הטובים ביותר כדי להביא לך חוויה יוצאת דופן',
  'privacy policy': 'מדיניות פרטיות',
  'terms & conditions': 'תנאים והגבלות',
  'at reviva, we are passionate about bringing you the freshest, most nutritious juices crafted from the finest ingredients. our journey began with a simple mission: to make healthy living accessible and delicious for everyone.': 'בראביבה, אנו נלהבים להביא לכם את המיצים הטריים והמזינים ביותר המיוצרים מהמרכיבים הטובים ביותר. המסע שלנו החל במשימה פשוטה: להפוך את החיים הבריאים לנגישים וטעימים לכולם',
  'we source our fruits and vegetables from trusted local farms, ensuring that every bottle of juice is packed with natural vitamins, minerals, and antioxidants. our team of expert juicemakers carefully blend each recipe to perfection, creating flavors that delight your taste buds while nourishing your body.': 'אנו מקבלים את הפירות והירקות שלנו מחוות מקומיות מהימנות, ומבטיחים שכל בקבוק מיץ מלא בוויטמינים, מינרלים ונוגדי חמצון טבעיים. הצוות שלנו של מומחי מיצים מערבב בקפידה כל מתכון לשלמות, יוצר טעמים שמשמחים את בלוטות הטעם שלך תוך הזנת הגוף שלך',
  'we specialize in creating premium, cold-pressed juices that preserve the maximum nutritional value of fresh produce. our innovative extraction process ensures that every sip delivers the full spectrum of vitamins and enzymes your body needs.': 'אנו מתמחים ביצירת מיצים פרמיום, סחוטים בקור, המשמרים את הערך התזונתי המקסימלי של תוצרת טרייה. תהליך החילוץ החדשני שלנו מבטיח שכל לגימה מספקת את המגוון המלא של ויטמינים ואנזימים שגופך צריך',
  "from revitalizing morning blends to detoxifying green juices, we offer a wide range of flavors to suit every palate and lifestyle. whether you're looking to boost your energy, support your immune system, or simply enjoy a refreshing drink, we have the perfect juice for you.": 'מתערובות בוקר ממריצות ועד מיצים ירוקים מטהרים, אנו מציעים מגוון רחב של טעמים המתאימים לכל חיך ואורח חיים. בין אם אתם מחפשים להגביר את האנרגיה שלכם, לתמוך במערכת החיסון שלכם, או פשוט ליהנות ממשקה מרענן, יש לנו את המיץ המושלם עבורכם.',
  '100% natural': '100% טבעי',
  'we use only fresh, organic ingredients with no artificial additives or preservatives.': 'אנו משתמשים רק במרכיבים טריים ואורגניים ללא תוספים מלאכותיים או חומרים משמרים',
  'health first': 'בריאות קודמת',
  'every recipe is designed to support your wellness journey and nourish your body.': 'כל מתכון מעוצב לתמוך במסע הבריאות שלך ולהזין את הגוף שלך',
  'community focused': 'ממוקד בקהילה',
  "we're committed to supporting local farmers and building a healthier community.": 'אנו מחויבים לתמוך בחקלאים מקומיים ולבנות קהילה בריאה יותר',
  'premium quality': 'איכות פרמיום',
  'we maintain the highest standards in every step of our production process.': 'אנו שומרים על הסטנדרטים הגבוהים ביותר בכל שלב בתהליך הייצור שלנו',
  'contact us': 'צור קשר',
  'our locations': 'המיקומים שלנו',
  'latest news': 'חדשות אחרונות',
  'view all': 'צפה בהכל',
  'view all news': 'צפה בכל החדשות',
  'read more': 'קרא עוד',
  'no news available at the moment.': 'אין חדשות זמינות כרגע',
  'roasted goodness!': 'טוב צלוי',
  'failed to fetch contacts': 'נכשל בטעינת אנשי קשר',
  'error fetching phone number:': 'שגיאה בטעינת מספר טלפון',
  'close menu': 'סגור תפריט',
  'open menu': 'פתח תפריט',
  'shopping cart': 'עגלת קניות',
  'reviva': 'ראביבה',
  'reviva logo': 'לוגו ראביבה',
  // Admin panel translations
  'dashboard': 'לוח בקרה',
  'admin panel': 'פאנל ניהול',
  'logout': 'התנתקות',
  'telegram delivery': 'משלוח טלגרם',
  'discounts & promos': 'הנחות וקופונים',
  'contacts': 'אנשי קשר',
  'ingredient management': 'ניהול מרכיבים',
  'manage boosters, fruits, and toppings. attach them to menu categories and set prices.': 'נהל בוסטרים, פירות ותוספות. צרף אותם לקטגוריות תפריט והגדר מחירים',
  'add ingredient': 'הוסף מרכיב',
  'fruits': 'פירות',
  'boosters': 'בוסטרים',
  'toppings': 'תוספות',
  'manage fruit ingredients. drag and drop to reorder.': 'נהל מרכיבי פירות. גרור ושחרר לסידור מחדש',
  'manage booster ingredients. drag and drop to reorder.': 'נהל מרכיבי בוסטרים. גרור ושחרר לסידור מחדש',
  'manage topping ingredients. drag and drop to reorder.': 'נהל מרכיבי תוספות. גרור ושחרר לסידור מחדש',
  'sort order': 'סדר מיון',
  'available': 'זמין',
  'actions': 'פעולות',
  'no fruits found. click "add ingredient" button above to get started.': 'לא נמצאו פירות. לחץ על כפתור "הוסף מרכיב" למעלה כדי להתחיל',
  'no boosters found. click "add ingredient" button above to get started.': 'לא נמצאו בוסטרים. לחץ על כפתור "הוסף מרכיב" למעלה כדי להתחיל',
  'no toppings found. click "add ingredient" button above to get started.': 'לא נמצאו תוספות. לחץ על כפתור "הוסף מרכיב" למעלה כדי להתחיל',
  'category configurations': 'הגדרות קטגוריות',
  'attach ingredients to menu categories. all items in a category will have access to these ingredients.': 'צרף מרכיבים לקטגוריות תפריט. כל הפריטים בקטגוריה יקבלו גישה למרכיבים אלה',
  'category name': 'שם קטגוריה',
  'attached ingredients': 'מרכיבים מצורפים',
  'configure': 'הגדר',
  'no categories found.': 'לא נמצאו קטגוריות',
  'edit ingredient': 'ערוך מרכיב',
  'add new ingredient': 'הוסף מרכיב חדש',
  'update ingredient details': 'עדכן פרטי מרכיב',
  'create a new ingredient': 'צור מרכיב חדש',
  'base price ($)': 'מחיר בסיס ($)',
  'ingredient category': 'קטגוריית מרכיב',
  'you can change this anytime. this only affects how ingredients are grouped in the admin panel. you can still attach any ingredient to any menu category.': 'אתה יכול לשנות זאת בכל עת. זה משפיע רק על איך המרכיבים מקובצים בפאנל הניהול. אתה עדיין יכול לצרף כל מרכיב לכל קטגוריית תפריט',
  'lower numbers appear first. controls display order in customer selection.': 'מספרים נמוכים יותר מופיעים קודם. שולט בסדר התצוגה בבחירת הלקוח',
  'image url': 'כתובת תמונה',
  'image url or use upload below': 'כתובת תמונה או השתמש בהעלאה למטה',
  'volume/weight options': 'אפשרויות נפח/משקל',
  'define volume or weight options (e.g., 100g, 250g, 1kg, 0.5l). customers can choose from these when selecting this ingredient.': 'הגדר אפשרויות נפח או משקל (למשל, 100גרם, 250גרם, 1ק"ג, 0.5ליטר). לקוחות יכולים לבחור מאלה בעת בחירת מרכיב זה',
  'add volume': 'הוסף נפח',
  'no volume options defined.': 'לא הוגדרו אפשרויות נפח',
  'click "add volume" to create options like "100g", "250g", "1kg", etc.': 'לחץ על "הוסף נפח" כדי ליצור אפשרויות כמו "100גרם", "250גרם", "1ק"ג" וכו',
  'volume/weight *': 'נפח/משקל *',
  'e.g., 100g, 250g, 1kg': 'למשל, 100גרם, 250גרם, 1ק"ג',
  'price ($) *': 'מחיר ($) *',
  'default': 'ברירת מחדל',
  'cancel': 'ביטול',
  'update': 'עדכן',
  'create': 'צור',
  'configure ingredients for': 'הגדר מרכיבים עבור',
  'attach ingredients to this category and configure their settings.': 'צרף מרכיבים לקטגוריה זו והגדר את ההגדרות שלהם',
  'available ingredients': 'מרכיבים זמינים',
  'you can add multiple ingredients. click "add" for each one you want to include.': 'אתה יכול להוסיף מספר מרכיבים. לחץ על "הוסף" עבור כל אחד שברצונך לכלול',
  'add all available': 'הוסף הכל זמין',
  'all ingredients are already attached': 'כל המרכיבים כבר מצורפים',
  'attached ingredients': 'מרכיבים מצורפים',
  'all ingredients listed here will be available when customers select items from this category': 'כל המרכיבים המפורטים כאן יהיו זמינים כאשר לקוחות בוחרים פריטים מקטגוריה זו',
  'no ingredients attached. add ingredients from the list above.': 'אין מרכיבים מצורפים. הוסף מרכיבים מהרשימה למעלה',
  'selection type': 'סוג בחירה',
  'multiple choice (recommended)': 'בחירה מרובה (מומלץ)',
  'single choice (choose one)': 'בחירה יחידה (בחר אחד)',
  'customers can select multiple ingredients from this category': 'לקוחות יכולים לבחור מספר מרכיבים מקטגוריה זו',
  'customers can only select one ingredient from this category': 'לקוחות יכולים לבחור רק מרכיב אחד מקטגוריה זו',
  'base price override ($) - optional': 'עקיפת מחיר בסיס ($) - אופציונלי',
  'base price if volume prices are not set': 'מחיר בסיס אם מחירי נפח לא הוגדרו',
  'price per volume/weight': 'מחיר לנפח/משקל',
  'set the price for this ingredient for each category volume option:': 'הגדר את המחיר עבור מרכיב זה עבור כל אפשרות נפח קטגוריה',
  'if a price is not set for a volume, the base price override (or ingredient base price) will be used.': 'אם מחיר לא הוגדר לנפח, עקיפת מחיר הבסיס (או מחיר הבסיס של המרכיב) ישמש',
  'save configuration': 'שמור הגדרות',
  'delete ingredient': 'מחק מרכיב',
  'are you sure you want to delete this ingredient? this will remove it from all juices.': 'האם אתה בטוח שברצונך למחוק מרכיב זה? זה יסיר אותו מכל המיצים',
  'validation error': 'שגיאת אימות',
  'ingredient name is required.': 'שם מרכיב נדרש',
  'success': 'הצלחה',
  'ingredient updated successfully!': 'מרכיב עודכן בהצלחה',
  'ingredient created successfully!': 'מרכיב נוצר בהצלחה',
  'error': 'שגיאה',
  'failed to save ingredient': 'נכשל בשמירת מרכיב',
  'failed to save volume options': 'נכשל בשמירת אפשרויות נפח',
  'failed to update ingredient order. please try again.': 'נכשל בעדכון סדר המרכיבים. אנא נסה שוב',
  'successfully saved': 'נשמר בהצלחה',
  'ingredient(s) to': 'מרכיב(ים) ל',
  '. customers will now see these ingredients when selecting items from this category.': 'לקוחות יראו כעת את המרכיבים האלה בעת בחירת פריטים מקטגוריה זו',
  'failed to save category configuration': 'נכשל בשמירת הגדרות קטגוריה',
  'no category selected. please select a category first.': 'לא נבחרה קטגוריה. אנא בחר קטגוריה תחילה',
  'already added': 'כבר נוסף',
  'is already attached to this category.': 'כבר מצורף לקטגוריה זו',
  'loading dashboard...': 'טוען לוח בקרה',
  'welcome to your admin panel': 'ברוך הבא לפאנל הניהול שלך',
  'total revenue': 'סה"כ הכנסות',
  'total sales revenue': 'סה"כ הכנסות ממכירות',
  'all time orders': 'הזמנות כל הזמנים',
  'available products': 'מוצרים זמינים',
  'active promo codes': 'קודי קופון פעילים',
  'top selling products': 'מוצרים מובילים במכירות',
  'best performing products': 'מוצרים בעלי ביצועים טובים',
  'sold': 'נמכר',
  'no sales data yet': 'אין עדיין נתוני מכירות',
  'orders by status': 'הזמנות לפי סטטוס',
  'current order distribution': 'התפלגות הזמנות נוכחית',
  'no orders yet': 'אין עדיין הזמנות',
  'recent orders': 'הזמנות אחרונות',
  'latest customer orders': 'הזמנות לקוחות אחרונות',
  'order id': 'מספר הזמנה',
  'customer': 'לקוח',
  'items': 'פריטים',
  'status': 'סטטוס',
  'date': 'תאריך',
  'revenue trend': 'מגמת הכנסות',
  'monthly revenue over the last 6 months': 'הכנסות חודשיות במהלך 6 החודשים האחרונים',
  'orders': 'הזמנות',
  'failed to load analytics. please check the server logs.': 'נכשל בטעינת אנליטיקה. אנא בדוק את לוגי השרת',
  'optional description': 'תיאור אופציונלי',
  'ingredient': 'מרכיב',
  'ingredients': 'מרכיבים',
  'add': 'הוסף',
  'to': 'ל',
  'category': 'קטגוריה',
};

/**
 * Translates English text to Hebrew
 * @param text - The text to translate (English text)
 * @returns The translated text in Hebrew
 */
export function translateToHebrew(text: string | null | undefined): string {
  if (!text) return '';
  
  // Check if text already contains Hebrew characters (Unicode range 0590-05FF)
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  
  if (hasHebrew) {
    // Text is already in Hebrew, return as-is
    return text;
  }
  
  // Try to find exact match in translations (case-insensitive)
  const trimmedText = text.trim();
  const lowerText = trimmedText.toLowerCase();
  
  // First try exact match
  if (hebrewTranslations[lowerText]) {
    return hebrewTranslations[lowerText];
  }
  
  // Sort translation keys by length (longest first) to match longer phrases first
  const sortedKeys = Object.keys(hebrewTranslations).sort((a, b) => b.length - a.length);
  
  // Try to find and replace matching phrases (longest first)
  let result = text;
  for (const key of sortedKeys) {
    if (key.length > 2 && lowerText.includes(key)) {
      // Create regex to match the key (case-insensitive, whole word or phrase)
      const regex = new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      if (regex.test(result.toLowerCase())) {
        result = result.replace(regex, (match) => {
          // Preserve original case pattern if possible
          if (match === match.toUpperCase()) {
            return hebrewTranslations[key].toUpperCase();
          } else if (match[0] === match[0].toUpperCase()) {
            return hebrewTranslations[key].charAt(0).toUpperCase() + hebrewTranslations[key].slice(1);
          }
          return hebrewTranslations[key];
        });
      }
    }
  }
  
  // If we made changes, return the result
  if (result !== text) {
    return result;
  }
  
  // Try to translate word by word as fallback
  const words = text.split(/\s+/);
  const translatedWords = words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    return hebrewTranslations[cleanWord] || word;
  });
  
  const translated = translatedWords.join(' ');
  
  // If translation didn't change anything, return original
  if (translated === text) {
    return text;
  }
  
  return translated;
}

/**
 * Alias for translateToHebrew for backward compatibility
 */
export function translateToEnglish(text: string | null | undefined): string {
  return translateToHebrew(text);
}

/**
 * Translates an object's string values from English to Hebrew
 * @param obj - Object with potentially English string values
 * @returns Object with translated values in Hebrew
 */
export function translateObject<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;
  
  const translated = { ...obj };
  
  // Common fields that might contain English text
  const translatableFields = [
    'name', 'title', 'description', 'content', 'label', 'message',
    'error', 'success', 'value', 'text', 'heading', 'subtitle',
    'city', 'address', 'country', 'hours', 'day_of_week', 'day',
    'customer_name', 'item_name', 'product_name', 'category_name',
    'ingredient_name', 'volume', 'type', 'phone', 'email', 'notes',
    'status', 'payment_method', 'delivery_address'
  ];
  
  for (const key in translated) {
    if (translatableFields.includes(key) && typeof translated[key] === 'string') {
      translated[key] = translateToHebrew(translated[key]);
    } else if (typeof translated[key] === 'object' && translated[key] !== null && !Array.isArray(translated[key])) {
      translated[key] = translateObject(translated[key]);
    } else if (Array.isArray(translated[key])) {
      translated[key] = translated[key].map((item: any) => 
        typeof item === 'object' ? translateObject(item) : 
        typeof item === 'string' ? translateToHebrew(item) : item
      );
    }
  }
  
  return translated;
}

/**
 * Hook for React components to translate text
 */
export function useTranslation() {
  return {
    t: translateToHebrew,
    translate: translateToHebrew,
    translateObject,
  };
}

