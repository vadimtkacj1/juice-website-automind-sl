/**
 * Main translations index - merges all translation files
 */
import { websiteTranslations } from './website';
import { adminCommonTranslations } from './admin/common';
import { adminMenuTranslations } from './admin/menu';
import { adminDashboardTranslations } from './admin/dashboard';
import { adminNewsTranslations } from './admin/news';
import { adminLocationsTranslations } from './admin/locations';
import { adminContactsTranslations } from './admin/contacts';
import { adminOrdersTranslations } from './admin/orders';
import { adminDiscountsTranslations } from './admin/discounts';
import { adminIngredientsTranslations } from './admin/ingredients';
import { adminBusinessHoursTranslations } from './admin/business-hours';
import { adminOrderPromptsTranslations } from './admin/order-prompts';

// Merge all translations
export const hebrewTranslations: Record<string, string> = {
  ...websiteTranslations,
  ...adminCommonTranslations,
  ...adminMenuTranslations,
  ...adminDashboardTranslations,
  ...adminNewsTranslations,
  ...adminLocationsTranslations,
  ...adminContactsTranslations,
  ...adminOrdersTranslations,
  ...adminDiscountsTranslations,
  ...adminIngredientsTranslations,
  ...adminBusinessHoursTranslations,
  ...adminOrderPromptsTranslations,
};

