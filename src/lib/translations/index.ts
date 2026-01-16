/**
 * Main translations index - merges all translation files
 */
import { websiteTranslations } from './website';
import { adminCommonTranslations } from './admin/common';
import { adminMenuTranslations } from './admin/menu';
import { adminDashboardTranslations } from './admin/dashboard';
import { adminLocationsTranslations } from './admin/locations';
import { adminContactsTranslations } from './admin/contacts';
import { adminOrdersTranslations } from './admin/orders';
import { adminDiscountsTranslations } from './admin/discounts';
import { adminIngredientsTranslations } from './admin/ingredients';
import { telegramTranslations } from './admin/telegram';

// Merge all translations
export const hebrewTranslations: Record<string, string> = {
  ...websiteTranslations,
  ...adminCommonTranslations,
  ...adminMenuTranslations,
  ...adminDashboardTranslations,
  ...adminLocationsTranslations,
  ...adminContactsTranslations,
  ...adminOrdersTranslations,
  ...adminDiscountsTranslations,
  ...adminIngredientsTranslations,
  ...telegramTranslations,
};

