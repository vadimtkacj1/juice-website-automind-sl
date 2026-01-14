export interface ProductModalItem {
  id: number;
  name: string;
  description?: string;
  price: number | string; // Can be string from MySQL DECIMAL
  volume?: string;
  image?: string;
  discount_percent: number | string; // Can be string from MySQL DECIMAL
  category_id?: number;
  [key: string]: any;
}

export interface CustomIngredient {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredient_category?: 'boosters' | 'fruits' | 'toppings';
  selection_type?: 'single' | 'multiple';
  price_override?: number;
  ingredient_group?: string;
  is_required?: boolean;
}

export interface VolumeOption {
  id?: number;
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

export interface AdditionalItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

