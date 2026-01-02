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
  'please provide your contact details so we can send you the order confirmation and reach out if needed.': 'אנא ספק את פרטי הקשר שלך כדי שנוכל לשלוח לך את אישור ההזמנה ולהיות בקשר במידת הצורך.',
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
  'natural juices from fresh fruits and vegetables': 'מיצים טבעיים מפירות וירקות טריים',
  'fresh juices': 'מיצים טריים',
  'welcome to reviva - your destination for fresh, natural, and delicious fruit products! we are a premium shop specializing in fresh fruit products, smoothies, natural juices, fruit salads, and healthy plates.': 'ברוכים הבאים לרוויבה - היעד שלכם למוצרי פירות טריים, טבעיים וטעימים! אנו חנות פרמיום המתמחה במוצרי פירות טריים, סמוזים, מיצים טבעיים, סלטי פירות וצלחות בריאות.',
  'every day, we prepare our products from the freshest fruits and vegetables, sourced directly from trusted local farms. whether you\'re looking for a refreshing smoothie, a nutritious juice, a colorful fruit salad, or a complete healthy plate - we have exactly what you need to nourish your body and delight your taste buds.': 'כל יום, אנו מכינים את המוצרים שלנו מהפירות והירקות הטריים ביותר, שמקורם ישירות מחוות מקומיות מהימנות. בין אם אתם מחפשים סמוזי מרענן, מיץ מזין, סלט פירות צבעוני, או צלחת בריאה מלאה - יש לנו בדיוק מה שאתם צריכים להזין את הגוף שלכם ולשמח את בלוטות הטעם שלכם.',
  'what we offer': 'מה אנחנו מציעים',
  'at reviva, we offer a complete range of fresh fruit products:': 'ברוויבה, אנו מציעים מגוון מלא של מוצרי פירות טריים:',
  'fresh natural juices - prepared daily from the finest fruits and vegetables': 'מיצים טבעיים טריים - מוכנים מדי יום מהפירות והירקות הטובים ביותר',
  'delicious smoothies - creamy and refreshing blends packed with vitamins': 'סמוזים טעימים - תערובות קרמיות ומרעננות עמוסות בוויטמינים',
  'colorful fruit salads - fresh seasonal fruits cut and prepared to order': 'סלטי פירות צבעוניים - פירות עונתיים טריים חתוכים ומוכנים לפי הזמנה',
  'healthy plates - complete nutritious meals with fruits, vegetables, and more': 'צלחות בריאות - ארוחות מזינות מלאות עם פירות, ירקות ועוד',
  'fresh fruit products - premium quality fruits ready to take home': 'מוצרי פירות טריים - פירות באיכות פרמיום מוכנים לקחת הביתה',
  'everything is prepared fresh daily, with no preservatives or artificial additives. just pure, natural goodness that your body will love!': 'הכל מוכן טרי מדי יום, ללא חומרים משמרים או תוספים מלאכותיים. פשוט טוב טבעי טהור שהגוף שלכם יאהב!',
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
  'latest news': 'חדשות אחרונות',
  'latest': 'אחרונות',
  'view all': 'צפה בכל',
  'view all news': 'צפה בכל החדשות',
  'read more': 'קרא עוד',
  'no news available at the moment.': 'אין חדשות זמינות כרגע',
  'roasted goodness!': 'טוב צלוי',
  'failed to fetch contacts': 'נכשל בטעינת אנשי קשר',
  'error fetching phone number:': 'שגיאה בטעינת מספר טלפון',
  'close menu': 'סגור תפריט',
  'open menu': 'פתח תפריט',
  'reviva': 'ראביבה',
  'reviva logo': 'לוגו ראביבה',
  // Admin panel translations
  'admin panel': 'פאנל ניהול',
  'telegram delivery': 'משלוח טלגרם',
  'discounts & promos': 'הנחות וקופונים',
  'contacts': 'אנשי קשר',
  'ingredient management': 'ניהול מרכיבים',
  'manage boosters, fruits, and toppings. attach them to menu categories and set prices.': 'נהל בוסטרים, פירות ותוספות. צרף אותם לקטגוריות תפריט והגדר מחירים',
  'add ingredient': 'הוסף מרכיב',
  'manage fruit ingredients. drag and drop to reorder.': 'נהל מרכיבי פירות. גרור ושחרר לסידור מחדש',
  'manage booster ingredients. drag and drop to reorder.': 'נהל מרכיבי בוסטרים. גרור ושחרר לסידור מחדש',
  'manage topping ingredients. drag and drop to reorder.': 'נהל מרכיבי תוספות. גרור ושחרר לסידור מחדש',
  'sort order': 'סדר מיון',
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
  'create': 'צור',
  'configure ingredients for': 'הגדר מרכיבים עבור',
  'attach ingredients to this category and configure their settings.': 'צרף מרכיבים לקטגוריה זו והגדר את ההגדרות שלהם',
  'available ingredients': 'מרכיבים זמינים',
  'you can add multiple ingredients. click "add" for each one you want to include.': 'אתה יכול להוסיף מספר מרכיבים. לחץ על "הוסף" עבור כל אחד שברצונך לכלול',
  'add all available': 'הוסף הכל זמין',
  'all ingredients are already attached': 'כל המרכיבים כבר מצורפים',
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
  'ingredient updated successfully!': 'מרכיב עודכן בהצלחה',
  'ingredient created successfully!': 'מרכיב נוצר בהצלחה',
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
  'revenue trend': 'מגמת הכנסות',
  'monthly revenue over the last 6 months': 'הכנסות חודשיות במהלך 6 החודשים האחרונים',
  'orders': 'הזמנות',
  'failed to load analytics. please check the server logs.': 'נכשל בטעינת אנליטיקה. אנא בדוק את לוגי השרת',
  'optional description': 'תיאור אופציונלי',
  'ingredient': 'מרכיב',
  'to': 'ל',
  // Admin panel additional translations
  'enter your credentials to access the admin dashboard': 'הזן את פרטי ההתחברות שלך כדי לגשת ללוח הבקרה',
  'signing in...': 'מתחבר...',
  'sign in': 'התחבר',
  'login failed': 'התחברות נכשלה',
  'an error occurred. please try again.': 'אירעה שגיאה. אנא נסה שוב',
  'checking authentication...': 'בודק אימות...',
  'menu management': 'ניהול תפריט',
  'categories, items, prices and discounts': 'קטגוריות, פריטים, מחירים והנחות',
  'total items': 'סה"כ פריטים',
  'on sale': 'במבצע',
  'menu items': 'פריטי תפריט',
  'all items': 'כל הפריטים',
  'manage menu items': 'נהל פריטי תפריט',
  'add item': 'הוסף פריט',
  'no items yet': 'אין עדיין פריטים',
  'none': 'אין',
  'delete menu item': 'מחק פריט תפריט',
  'are you sure you want to delete this menu item? this action cannot be undone.': 'האם אתה בטוח שברצונך למחוק פריט תפריט זה? פעולה זו לא ניתנת לביטול',
  'menu item deleted successfully.': 'פריט תפריט נמחק בהצלחה',
  'failed to delete menu item.': 'נכשל במחיקת פריט תפריט',
  'an error occurred while deleting the menu item.': 'אירעה שגיאה בעת מחיקת פריט התפריט',
  'set discount': 'הגדר הנחה',
  'discount for:': 'הנחה עבור:',
  'current price': 'מחיר נוכחי',
  'delete category': 'מחק קטגוריה',
  'are you sure you want to delete this category? make sure to remove all items from this category first. this action cannot be undone.': 'האם אתה בטוח שברצונך למחוק קטגוריה זו? ודא להסיר תחילה את כל הפריטים מקטגוריה זו. פעולה זו לא ניתנת לביטול',
  'category deleted successfully.': 'קטגוריה נמחקה בהצלחה',
  'error deleting category.': 'שגיאה במחיקת קטגוריה',
  'an error occurred while deleting the category.': 'אירעה שגיאה בעת מחיקת הקטגוריה',
  'edit category': 'ערוך קטגוריה',
  'new category': 'קטגוריה חדשה',
  'update category information': 'עדכן מידע קטגוריה',
  'create a new menu category': 'צור קטגוריית תפריט חדשה',
  'category name is required.': 'שם קטגוריה נדרש',
  'category updated successfully.': 'קטגוריה עודכנה בהצלחה',
  'category created successfully.': 'קטגוריה נוצרה בהצלחה',
  'error saving category.': 'שגיאה בשמירת קטגוריה',
  'an error occurred while saving the category.': 'אירעה שגיאה בעת שמירת הקטגוריה',
  'lower numbers appear first': 'מספרים נמוכים יותר מופיעים קודם',
  'active': 'פעיל',
  'inactive': 'לא פעיל',
  'orders management': 'ניהול הזמנות',
  'view and manage customer orders': 'צפה ונהל הזמנות לקוחות',
  'all orders': 'כל ההזמנות',
  'a list of all customer orders': 'רשימה של כל הזמנות הלקוחות',
  'all': 'הכל',
  'no pending orders': 'אין הזמנות ממתינות',
  'no completed orders': 'אין הזמנות שהושלמו',
  'no cancelled orders': 'אין הזמנות שבוטלו',
  'order details': 'פרטי הזמנה',
  'complete information about this order': 'מידע מלא על הזמנה זו',
  'customer name': 'שם לקוח',
  'n/a': 'לא זמין',
  'total amount': 'סכום כולל',
  'notes': 'הערות',
  'no notes': 'אין הערות',
  'order items': 'פריטי הזמנה',
  'subtotal': 'סיכום ביניים',
  'close': 'סגור',
  'delete order': 'מחק הזמנה',
  'are you sure you want to delete this order? this action cannot be undone.': 'האם אתה בטוח שברצונך למחוק הזמנה זו? פעולה זו לא ניתנת לביטול',
  'loading orders...': 'טוען הזמנות...',
  'loading menu...': 'טוען תפריט...',
  'discounts & promo codes': 'הנחות וקודי קופון',
  'manage discounts and promotional codes': 'נהל הנחות וקודי קופון',
  'product discounts': 'הנחות מוצרים',
  'manage discounts for products': 'נהל הנחות למוצרים',
  'add discount': 'הוסף הנחה',
  'type': 'סוג',
  'value': 'ערך',
  'all products': 'כל המוצרים',
  'no discounts yet': 'אין עדיין הנחות',
  'configure discount settings': 'הגדר הגדרות הנחה',
  'discount name': 'שם הנחה',
  'percentage': 'אחוז',
  'fixed amount': 'סכום קבוע',
  'product (optional)': 'מוצר (אופציונלי)',
  'save discount': 'שמור הנחה',
  'promo codes': 'קודי קופון',
  'manage promotional codes for customers': 'נהל קודי קופון ללקוחות',
  'generate promo code': 'צור קוד קופון',
  'code': 'קוד',
  'usage': 'שימוש',
  'no promo codes yet': 'אין עדיין קודי קופון',
  'generate': 'צור',
  'promo code': 'קוד קופון',
  'configure promo code settings': 'הגדר הגדרות קוד קופון',
  'discount type': 'סוג הנחה',
  'discount value': 'ערך הנחה',
  'usage limit (optional)': 'הגבלת שימוש (אופציונלי)',
  'leave empty for unlimited': 'השאר ריק ללא הגבלה',
  'save promo code': 'שמור קוד קופון',
  'are you sure you want to delete this discount?': 'האם אתה בטוח שברצונך למחוק הנחה זו?',
  'are you sure you want to delete this promo code?': 'האם אתה בטוח שברצונך למחוק קוד קופון זה?',
  'failed to save promo code': 'נכשל בשמירת קוד קופון',
  'loading discounts...': 'טוען הנחות...',
  'news management': 'ניהול חדשות',
  'manage news articles and announcements': 'נהל מאמרי חדשות והודעות',
  'all news': 'כל החדשות',
  'news items displayed on the website': 'פריטי חדשות המוצגים באתר',
  'add news': 'הוסף חדשות',
  'no news items yet': 'אין עדיין פריטי חדשות',
  'add your first news item': 'הוסף את פריט החדשות הראשון שלך',
  'hidden': 'מוסתר',
  'are you sure you want to delete this news item?': 'האם אתה בטוח שברצונך למחוק פריט חדשות זה?',
  'loading news...': 'טוען חדשות...',
  'locations management': 'ניהול מיקומים',
  'manage store locations, images, and contact information': 'נהל מיקומי חנויות, תמונות ומידע ליצירת קשר',
  'all locations': 'כל המיקומים',
  'store locations displayed on the website': 'מיקומי חנויות המוצגים באתר',
  'add location': 'הוסף מיקום',
  'no locations yet': 'אין עדיין מיקומים',
  'add your first location': 'הוסף את המיקום הראשון שלך',
  'are you sure you want to delete this location?': 'האם אתה בטוח שברצונך למחוק מיקום זה?',
  'contacts management': 'ניהול אנשי קשר',
  'manage contact information and methods': 'נהל מידע ושיטות ליצירת קשר',
  'all contacts': 'כל אנשי הקשר',
  'contact methods and information': 'שיטות ומידע ליצירת קשר',
  'add contact': 'הוסף איש קשר',
  'no contacts yet': 'אין עדיין אנשי קשר',
  'are you sure you want to delete this contact?': 'האם אתה בטוח שברצונך למחוק איש קשר זה?',
  'loading contacts...': 'טוען אנשי קשר...',
  // Privacy Policy translations
  'last updated:': 'עודכן לאחרונה:',
  'introduction': 'הקדמה',
  'welcome to reviva ("we," "our," or "us"). we are committed to protecting your personal information and your right to privacy. this privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.': 'ברוכים הבאים לראביבה ("אנחנו", "שלנו" או "אנו"). אנו מחויבים להגן על המידע האישי שלך ועל זכותך לפרטיות. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, חושפים ומגנים על המידע שלך בעת ביקורך באתר שלנו ושימוש בשירותינו',
  'please read this privacy policy carefully. if you do not agree with the terms of this privacy policy, please do not access the site.': 'אנא קרא את מדיניות הפרטיות הזו בעיון. אם אינך מסכים לתנאי מדיניות הפרטיות הזו, אנא אל תגש לאתר',
  'information we collect': 'מידע שאנו אוספים',
  'information you provide to us': 'מידע שאתה מספק לנו',
  'we collect information that you provide directly to us, including:': 'אנו אוספים מידע שאתה מספק לנו ישירות, כולל:',
  'personal information:': 'מידע אישי:',
  'name, email address, phone number, and shipping address when you place an order': 'שם, כתובת אימייל, מספר טלפון וכתובת משלוח בעת ביצוע הזמנה',
  'payment information:': 'מידע תשלום:',
  'payment card details processed through our secure payment gateway (we do not store full card details)': 'פרטי כרטיס תשלום המעובדים דרך שער התשלום המאובטח שלנו (אנו לא שומרים פרטי כרטיס מלאים)',
  'account information:': 'מידע חשבון:',
  'username and password for admin accounts': 'שם משתמש וסיסמה לחשבונות מנהל',
  'communication data:': 'נתוני תקשורת:',
  'messages, feedback, and correspondence you send to us': 'הודעות, משוב והתכתבות שאתה שולח לנו',
  'information automatically collected': 'מידע שנאסף אוטומטית',
  'when you visit our website, we automatically collect certain information, including:': 'כאשר אתה מבקר באתר שלנו, אנו אוספים אוטומטית מידע מסוים, כולל:',
  'usage data:': 'נתוני שימוש:',
  'pages visited, time spent on pages, click patterns, and navigation paths': 'דפים שבוקרו, זמן שהושקע בדפים, דפוסי לחיצה ונתיבי ניווט',
  'device information:': 'מידע מכשיר:',
  'ip address, browser type, device type, operating system, and screen resolution': 'כתובת IP, סוג דפדפן, סוג מכשיר, מערכת הפעלה ורזולוציית מסך',
  'cookies and tracking technologies:': 'עוגיות וטכנולוגיות מעקב:',
  'we use cookies to enhance your experience and analyze site usage': 'אנו משתמשים בעוגיות כדי לשפר את החוויה שלך ולנתח את השימוש באתר',
  'how we use your information': 'איך אנו משתמשים במידע שלך',
  'we use the information we collect for the following purposes:': 'אנו משתמשים במידע שאנו אוספים למטרות הבאות:',
  'to process and fulfill your orders': 'לעבד ולמלא את ההזמנות שלך',
  'to communicate with you about your orders, account, and our services': 'לתקשר איתך לגבי ההזמנות שלך, החשבון והשירותים שלנו',
  'to send you marketing communications (with your consent)': 'לשלוח לך תקשורת שיווקית (עם הסכמתך)',
  'to improve our website, products, and services': 'לשפר את האתר, המוצרים והשירותים שלנו',
  'to prevent fraud and ensure security': 'למנוע הונאה ולהבטיח אבטחה',
  'to comply with legal obligations': 'לעמוד בהתחייבויות משפטיות',
  'to respond to your inquiries and provide customer support': 'להגיב לשאלות שלך ולספק תמיכה ללקוחות',
  'information sharing and disclosure': 'שיתוף וחשיפת מידע',
  'we do not sell your personal information. we may share your information in the following circumstances:': 'אנו לא מוכרים את המידע האישי שלך. אנו עשויים לשתף את המידע שלך בנסיבות הבאות:',
  'service providers:': 'ספקי שירותים:',
  'with third-party service providers who perform services on our behalf (payment processing, shipping, analytics)': 'עם ספקי שירותים צד שלישי המבצעים שירותים בשמנו (עיבוד תשלומים, משלוח, אנליטיקה)',
  'legal requirements:': 'דרישות משפטיות:',
  'when required by law or to protect our rights and safety': 'כאשר נדרש על פי חוק או כדי להגן על הזכויות והבטיחות שלנו',
  'business transfers:': 'העברות עסקיות:',
  'in connection with a merger, acquisition, or sale of assets': 'בקשר למיזוג, רכישה או מכירת נכסים',
  'with your consent:': 'עם הסכמתך:',
  'when you have given us explicit permission to share your information': 'כאשר נתת לנו הרשאה מפורשת לשתף את המידע שלך',
  'data security': 'אבטחת נתונים',
  'we implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. however, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.': 'אנו מיישמים אמצעי אבטחה טכניים וארגוניים מתאימים כדי להגן על המידע האישי שלך מפני גישה לא מורשית, שינוי, חשיפה או הרס. עם זאת, אין שיטת העברה דרך האינטרנט או אחסון אלקטרוני שהיא מאובטחת ב-100%, ואנו לא יכולים להבטיח אבטחה מוחלטת',
  'your rights and choices': 'הזכויות והבחירות שלך',
  'you have the following rights regarding your personal information:': 'יש לך את הזכויות הבאות לגבי המידע האישי שלך:',
  'access:': 'גישה:',
  'request access to your personal information': 'בקש גישה למידע האישי שלך',
  'correction:': 'תיקון:',
  'request correction of inaccurate or incomplete information': 'בקש תיקון של מידע לא מדויק或不完整',
  'deletion:': 'מחיקה:',
  'request deletion of your personal information': 'בקש מחיקה של המידע האישי שלך',
  'opt-out:': 'הסרה:',
  'unsubscribe from marketing communications': 'הסר הרשמה מתקשורת שיווקית',
  'data portability:': 'ניידות נתונים:',
  'request a copy of your data in a portable format': 'בקש עותק של הנתונים שלך בפורמט נייד',
  'to exercise these rights, please contact us using the information provided in the "contact us" section.': 'כדי לממש זכויות אלה, אנא צור איתנו קשר באמצעות המידע המסופק בסעיף "צור קשר"',
  'cookies and tracking technologies': 'עוגיות וטכנולוגיות מעקב',
  'we use cookies and similar tracking technologies to track activity on our website and store certain information. you can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. however, if you do not accept cookies, you may not be able to use some portions of our website.': 'אנו משתמשים בעוגיות וטכנולוגיות מעקב דומות כדי לעקוב אחר פעילות באתר שלנו ולאחסן מידע מסוים. אתה יכול להורות לדפדפן שלך לסרב לכל העוגיות או לציין מתי נשלחת עוגיה. עם זאת, אם אינך מקבל עוגיות, ייתכן שלא תוכל להשתמש בחלקים מסוימים באתר שלנו',
  'children\'s privacy': 'פרטיות ילדים',
  'our services are not intended for individuals under the age of 18. we do not knowingly collect personal information from children. if you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.': 'השירותים שלנו לא מיועדים לאנשים מתחת לגיל 18. אנו לא אוספים במודע מידע אישי מילדים. אם אתה הורה או אפוטרופוס ומאמין שילדך סיפק לנו מידע אישי, אנא צור איתנו קשר מיד',
  'international data transfers': 'העברות נתונים בינלאומיות',
  'your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. by using our services, you consent to the transfer of your information to these facilities.': 'המידע שלך עשוי להיות מועבר ונשמר במחשבים הממוקמים מחוץ למדינה, למחוז, למדינה או לשיפוט ממשלתי אחר שלך שבו חוקי הגנת הנתונים עשויים להיות שונים. על ידי שימוש בשירותים שלנו, אתה מסכים להעברת המידע שלך למתקנים אלה',
  'changes to this privacy policy': 'שינויים במדיניות פרטיות זו',
  'we may update this privacy policy from time to time. we will notify you of any changes by posting the new privacy policy on this page and updating the "last updated" date. you are advised to review this privacy policy periodically for any changes.': 'אנו עשויים לעדכן את מדיניות הפרטיות הזו מעת לעת. אנו נודיע לך על כל שינוי על ידי פרסום מדיניות הפרטיות החדשה בדף זה ועדכון תאריך "עודכן לאחרונה". מומלץ לך לבדוק את מדיניות הפרטיות הזו מעת לעת לכל שינוי',
  'if you have any questions about this privacy policy, please contact us:': 'אם יש לך שאלות כלשהן לגבי מדיניות פרטיות זו, אנא צור איתנו קשר:',
  'email:': 'אימייל:',
  'phone:': 'טלפון:',
  // Terms and Conditions translations
  'terms and conditions': 'תנאים והגבלות',
  'acceptance of terms': 'קבלת תנאים',
  'by accessing and using the reviva website and services, you accept and agree to be bound by the terms and provision of this agreement. if you do not agree to abide by the above, please do not use this service.': 'על ידי גישה לשימוש באתר ובשירותי ראביבה, אתה מקבל ומסכים להיות מחויב לתנאים והוראות של הסכם זה. אם אינך מסכים לפעול לפי האמור לעיל, אנא אל תשתמש בשירות זה',
  'use license': 'רישיון שימוש',
  'permission is granted to temporarily access the materials on reviva\'s website for personal, non-commercial transitory viewing only. this is the grant of a license, not a transfer of title, and under this license you may not:': 'ניתנת הרשאה לגשת זמנית לחומרים באתר ראביבה לצפייה אישית, לא מסחרית וזמנית בלבד. זו מתן רישיון, לא העברת בעלות, ובמסגרת רישיון זה אינך רשאי:',
  'modify or copy the materials': 'לשנות או להעתיק את החומרים',
  'use the materials for any commercial purpose or for any public display': 'להשתמש בחומרים למטרה מסחרית כלשהי או לתצוגה ציבורית כלשהי',
  'attempt to reverse engineer any software contained on the website': 'לנסות להנדס לאחור כל תוכנה הכלולה באתר',
  'remove any copyright or other proprietary notations from the materials': 'להסיר כל זכויות יוצרים או סימונים קנייניים אחרים מהחומרים',
  'transfer the materials to another person or "mirror" the materials on any other server': 'להעביר את החומרים לאדם אחר או "לשקף" את החומרים בכל שרת אחר',
  'orders and payment': 'הזמנות ותשלום',
  'order acceptance': 'קבלת הזמנה',
  'all orders are subject to acceptance by reviva. we reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraud.': 'כל ההזמנות כפופות לקבלה על ידי ראביבה. אנו שומרים לעצמנו את הזכות לסרב או לבטל כל הזמנה מכל סיבה שהיא, כולל אך לא רק זמינות מוצר, שגיאות במחירים או במידע על המוצר, או חשד להונאה',
  'pricing': 'תמחור',
  'all prices are displayed in the currency specified on the website. prices are subject to change without notice. we reserve the right to correct any pricing errors, even after an order has been placed.': 'כל המחירים מוצגים במטבע שצוין באתר. המחירים כפופים לשינוי ללא הודעה מוקדמת. אנו שומרים לעצמנו את הזכות לתקן כל שגיאות תמחור, גם לאחר ביצוע הזמנה',
  'payment': 'תשלום',
  'payment must be made at the time of order. we accept payment through our secure payment gateway. by providing payment information, you represent and warrant that you are authorized to use the payment method provided.': 'התשלום חייב להתבצע בעת ההזמנה. אנו מקבלים תשלום דרך שער התשלום המאובטח שלנו. על ידי מתן מידע תשלום, אתה מצהיר ומבטיח שיש לך הרשאה להשתמש בשיטת התשלום שסופקה',
  'order confirmation': 'אישור הזמנה',
  'you will receive an order confirmation email once your order has been received. this confirmation does not constitute acceptance of your order, but merely confirms that we have received it.': 'תקבל אימייל אישור הזמנה ברגע שההזמנה שלך התקבלה. אישור זה אינו מהווה קבלה של ההזמנה שלך, אלא רק מאשר שקיבלנו אותה',
  'products and services': 'מוצרים ושירותים',
  'product availability': 'זמינות מוצר',
  'we strive to maintain accurate inventory information, but we cannot guarantee that all products will be available at all times. if a product becomes unavailable after you place an order, we will notify you and provide a refund or alternative.': 'אנו שואפים לשמור על מידע מלאי מדויק, אך איננו יכולים להבטיח שכל המוצרים יהיו זמינים בכל עת. אם מוצר הופך ללא זמין לאחר שביצעת הזמנה, אנו נודיע לך ונספק החזר או חלופה',
  'product descriptions': 'תיאורי מוצר',
  'we attempt to be as accurate as possible in product descriptions. however, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.': 'אנו מנסים להיות מדויקים ככל האפשר בתיאורי מוצרים. עם זאת, אנו לא מבטיחים שתיאורי מוצרים או תוכן אחר באתר זה מדויקים, מלאים, אמינים, עדכניים או נטולי שגיאות',
  'customization': 'התאמה אישית',
  'customized products (including ingredients, volumes, and addons) are prepared according to your specifications. once an order is placed, changes may not be possible. please review your order carefully before confirming.': 'מוצרים מותאמים אישית (כולל מרכיבים, נפחים ותוספות) מוכנים לפי המפרטים שלך. לאחר ביצוע הזמנה, ייתכן שלא ניתן לבצע שינויים. אנא בדוק את ההזמנה שלך בעיון לפני אישור',
  'delivery and shipping': 'משלוח ומסירה',
  'delivery areas': 'אזורי משלוח',
  'we deliver to the areas specified on our website. delivery times are estimates and not guaranteed. we are not liable for delays caused by circumstances beyond our control.': 'אנו מספקים לאזורים שצוינו באתר שלנו. זמני משלוח הם הערכות ולא מובטחים. אנו לא אחראים לעיכובים הנגרמים על ידי נסיבות שמחוץ לשליטתנו',
  'delivery charges': 'עמלות משלוח',
  'delivery charges, if applicable, will be displayed at checkout. these charges are in addition to the product price.': 'עמלות משלוח, אם חלות, יוצגו בקופה. עמלות אלה בנוסף למחיר המוצר',
  'risk of loss': 'סיכון אובדן',
  'all items purchased from reviva are made pursuant to a shipment contract. the risk of loss and title for such items pass to you upon delivery to the carrier.': 'כל הפריטים שנרכשו מראביבה נעשים בהתאם לחוזה משלוח. סיכון האובדן והבעלות על פריטים אלה עוברים אליך בעת המסירה למוביל',
  'returns and refunds': 'החזרות והחזרים',
  'return policy': 'מדיניות החזרות',
  'due to the perishable nature of our products, returns are generally not accepted. however, if you receive a damaged or incorrect item, please contact us within 24 hours of delivery.': 'בגלל אופי המוצרים המתכלים שלנו, החזרות בדרך כלל לא מתקבלות. עם זאת, אם קיבלת פריט פגום או שגוי, אנא צור איתנו קשר תוך 24 שעות מהמשלוח',
  'refunds': 'החזרים',
  'refunds will be processed to the original payment method within 5-10 business days. we reserve the right to refuse refunds if we determine that the product was not defective or incorrectly delivered.': 'החזרים יעובדו לשיטת התשלום המקורית תוך 5-10 ימי עסקים. אנו שומרים לעצמנו את הזכות לסרב להחזרים אם נקבע שהמוצר לא היה פגום או נמסר בצורה שגויה',
  'cancellations': 'ביטולים',
  'orders may be cancelled before preparation begins. once preparation has started, cancellations may not be possible. contact us immediately if you need to cancel an order.': 'הזמנות יכולות להתבטל לפני תחילת ההכנה. לאחר שההכנה החלה, ייתכן שלא ניתן לבטל. צור איתנו קשר מיד אם אתה צריך לבטל הזמנה',
  'user accounts': 'חשבונות משתמשים',
  'if you create an account on our website, you are responsible for maintaining the confidentiality of your account and password. you agree to accept responsibility for all activities that occur under your account.': 'אם אתה יוצר חשבון באתר שלנו, אתה אחראי לשמירה על סודיות החשבון והסיסמה שלך. אתה מסכים לקבל אחריות על כל הפעילויות המתרחשות תחת החשבון שלך',
  'prohibited uses': 'שימושים אסורים',
  'you may not use our website:': 'אינך רשאי להשתמש באתר שלנו:',
  'in any way that violates any applicable law or regulation': 'בכל דרך המפרה כל חוק או תקנה חלים',
  'to transmit any malicious code or viruses': 'להעביר כל קוד זדוני או וירוסים',
  'to impersonate or attempt to impersonate the company or any employee': 'להתחזות או לנסות להתחזות לחברה או לכל עובד',
  'to engage in any automated use of the system': 'לעסוק בכל שימוש אוטומטי במערכת',
  'to interfere with or disrupt the website or servers': 'להפריע או לשבש את האתר או השרתים',
  'to collect or track personal information of others': 'לאסוף או לעקוב אחר מידע אישי של אחרים',
  'intellectual property': 'קניין רוחני',
  'all content on this website, including text, graphics, logos, images, and software, is the property of reviva or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.': 'כל התוכן באתר זה, כולל טקסט, גרפיקה, לוגואים, תמונות ותוכנה, הוא רכוש של ראביבה או ספקי התוכן שלה ומוגן על ידי חוקי זכויות יוצרים, סימן מסחרי וקניין רוחני אחרים',
  'limitation of liability': 'הגבלת אחריות',
  'to the fullest extent permitted by law, reviva shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.': 'במידה המקסימלית המותרת על פי חוק, ראביבה לא תהיה אחראית לכל נזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים, או כל אובדן רווחים או הכנסות, בין אם נגרמו ישירות או בעקיפין, או כל אובדן נתונים, שימוש, מוניטין או הפסדים בלתי מוחשיים אחרים הנובעים משימוש שלך בשירותים שלנו',
  'indemnification': 'פיצוי',
  'you agree to defend, indemnify, and hold harmless reviva and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney\'s fees, arising out of or in any way connected with your use of our services or violation of these terms.': 'אתה מסכים להגן, לפצות ולשחרר מראש את ראביבה והקצינים, המנהלים, העובדים והסוכנים שלה מפני כל תביעות, התחייבויות, נזקים, הפסדים והוצאות, כולל שכר טרחה סביר של עורכי דין, הנובעים או קשורים בכל דרך לשימוש שלך בשירותים שלנו או להפרת תנאים אלה',
  'governing law': 'דין שולט',
  'these terms shall be governed by and construed in accordance with the laws of [your jurisdiction], without regard to its conflict of law provisions. any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of [your jurisdiction].': 'תנאים אלה יוסדרו ויפורשו בהתאם לחוקי [השיפוט שלך], ללא התחשבות בהוראות סכסוך החוקים שלו. כל סכסוכים הנובעים או הקשורים לתנאים אלה יהיו כפופים לשיפוט הבלעדי של בתי המשפט של [השיפוט שלך]',
  'changes to terms': 'שינויים בתנאים',
  'we reserve the right to modify these terms at any time. we will notify users of any material changes by posting the new terms on this page and updating the "last updated" date. your continued use of our services after such changes constitutes acceptance of the new terms.': 'אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. אנו נודיע למשתמשים על כל שינוי מהותי על ידי פרסום התנאים החדשים בדף זה ועדכון תאריך "עודכן לאחרונה". המשך השימוש שלך בשירותים שלנו לאחר שינויים כאלה מהווה קבלה של התנאים החדשים',
  'contact information': 'פרטי יצירת קשר',
  'if you have any questions about these terms and conditions, please contact us:': 'אם יש לך שאלות כלשהן לגבי תנאים והגבלות אלה, אנא צור איתנו קשר:',
  // Additional missing translations
  'enter your username': 'הזן את שם המשתמש שלך',
  'enter your password': 'הזן את הסיסמה שלך',
  'category description (optional)': 'תיאור קטגוריה (אופציונלי)',
  'no categories yet': 'אין עדיין קטגוריות',
  'active promos': 'קופונים פעילים',
  'discount (%)': 'הנחה (%)',
  'add category': 'הוסף קטגוריה',
  // Additional admin panel translations with proper capitalization
  'Dashboard': 'לוח בקרה',
  'Menu': 'תפריט',
  'Orders': 'הזמנות',
  'Ingredients': 'מרכיבים',
  'News': 'חדשות',
  'Locations': 'מיקומים',
  'Contacts': 'אנשי קשר',
  'Logout': 'התנתקות',
  'Admin Panel': 'פאנל ניהול',
  'Telegram Delivery': 'משלוח טלגרם',
  'Discounts & Promos': 'הנחות וקופונים',
  'Username': 'שם משתמש',
  'Password': 'סיסמה',
  'Enter your username': 'הזן את שם המשתמש שלך',
  'Enter your password': 'הזן את הסיסמה שלך',
  'Login': 'התחבר',
  'Checking authentication...': 'בודק אימות...',
  'Total Revenue': 'סה"כ הכנסות',
  'All Time Orders': 'הזמנות כל הזמנים',
  'Available Products': 'מוצרים זמינים',
  'Active Promo Codes': 'קודי קופון פעילים',
  'Failed to load analytics. Please check the server logs.': 'נכשל בטעינת ניתוח. אנא בדוק את לוגי השרת.',
  'All': 'הכל',
  'Pending': 'ממתין',
  'Completed': 'הושלם',
  'Cancelled': 'בוטל',
  'Add Location': 'הוסף מיקום',
  'Add Contact': 'הוסף איש קשר',
  'Add News': 'הוסף חדשות',
  'category details': 'פרטי קטגוריה',
  'fill in the category information': 'מלא את פרטי הקטגוריה',
  'lower numbers appear first in the menu': 'מספרים נמוכים יותר מופיעים קודם בתפריט',
  'creating...': 'יוצר...',
  'update category': 'עדכן קטגוריה',
  'modify category details': 'ערוך פרטי קטגוריה',
  'update the category information': 'עדכן את פרטי הקטגוריה',
  'updating...': 'מעדכן...',
  'active (show on website)': 'פעיל (הצג באתר)',
  'loading category...': 'טוען קטגוריה...',
  'category not found': 'קטגוריה לא נמצאה',
  'error loading category': 'שגיאה בטעינת קטגוריה',
  'error updating category': 'שגיאה בעדכון קטגוריה',
  'error adding category': 'שגיאה בהוספת קטגוריה',
  'are you sure you want to delete this business hour entry?': 'האם אתה בטוח שברצונך למחוק רשומת שעות פעילות זו?',
  'failed to delete business hour.': 'נכשל במחיקת שעות פעילות',
  'courier deleted successfully!': 'שליח נמחק בהצלחה',
  'failed to delete courier': 'נכשל במחיקת שליח',
  'edit courier': 'ערוך שליח',
  'add courier': 'הוסף שליח',
  'update courier information': 'עדכן פרטי שליח',
  'add a new courier to the system': 'הוסף שליח חדש למערכת',
  'telegram id *': 'מזהה טלגרם *',
  'find your telegram id using @userinfobot': 'מצא את מזהה הטלגרם שלך באמצעות @userinfobot',
  'loading business hours...': 'טוען שעות פעילות...',
  'failed to load business hours.': 'נכשל בטעינת שעות פעילות',
  'failed to add contact': 'נכשל בהוספת איש קשר',
  'create a new contact method': 'צור שיטת קשר חדשה',
  'enter the contact details': 'הזן את פרטי הקשר',
  'contact type': 'סוג קשר',
  'contact value': 'ערך קשר',
  'select type': 'בחר סוג',
  'other': 'אחר',
  'create contact': 'צור איש קשר',
};

// Global variable to track text mode for server-side rendering compatibility
let currentTextMode: 'hebrew' | 'english' = 'hebrew';

// Listen for text mode changes if in browser
if (typeof window !== 'undefined') {
  window.addEventListener('textModeChanged', ((event: CustomEvent) => {
    currentTextMode = event.detail.mode;
    (window as any).__textMode = event.detail.mode;
  }) as EventListener);
  
  // Initialize from document attribute or window variable on load
  if (document.documentElement) {
    const mode = document.documentElement.getAttribute('data-text-mode') || (window as any).__textMode;
    if (mode === 'hebrew' || mode === 'english') {
      currentTextMode = mode;
      (window as any).__textMode = mode;
    }
  }
}

/**
 * Translates English text to Hebrew
 * @param text - The text to translate (English text)
 * @returns The translated text in Hebrew or English based on text mode
 */
export function translateToHebrew(text: string | null | undefined): string {
  if (!text) return '';
  
  // Check current text mode from document attribute (for client-side) or global variable (for SSR)
  const textMode = typeof document !== 'undefined' 
    ? (document.documentElement.getAttribute('data-text-mode') as 'hebrew' | 'english') || currentTextMode
    : currentTextMode;
  
  // If mode is English, return original text (no translation)
  if (textMode === 'english') {
    return text;
  }
  
  // Check if text already contains Hebrew characters (Unicode range 0590-05FF)
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  
  if (hasHebrew) {
    // Text is already in Hebrew, return as-is
    return text;
  }
  
  // Try to find exact match in translations (case-insensitive)
  const trimmedText = text.trim();
  const lowerText = trimmedText.toLowerCase();
  
  // First try exact match (lowercase)
  if (hebrewTranslations[lowerText]) {
    // Preserve original capitalization if it was capitalized
    if (trimmedText[0] === trimmedText[0].toUpperCase() && trimmedText.length > 1) {
      const translation = hebrewTranslations[lowerText];
      return translation.charAt(0).toUpperCase() + translation.slice(1);
    }
    return hebrewTranslations[lowerText];
  }
  
  // Try exact match with original case (for capitalized keys like 'Dashboard')
  if (hebrewTranslations[trimmedText]) {
    return hebrewTranslations[trimmedText];
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
    const value = translated[key];
    if (translatableFields.includes(key) && typeof value === 'string') {
      (translated as any)[key] = translateToHebrew(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (translated as any)[key] = translateObject(value);
    } else if (Array.isArray(value)) {
      (translated as any)[key] = value.map((item: any) => 
        typeof item === 'object' ? translateObject(item) : 
        typeof item === 'string' ? translateToHebrew(item) : item
      );
    }
  }
  
  return translated;
}

/**
 * Hook for React components to translate text
 * This version will cause re-renders when text mode changes
 */
export function useTranslation() {
  // Import useTextMode dynamically to avoid circular dependencies
  // Components using this hook should import useTextMode directly if they need reactivity
  return {
    t: translateToHebrew,
    translate: translateToHebrew,
    translateObject,
  };
}

