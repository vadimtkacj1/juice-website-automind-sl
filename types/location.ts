export interface Location {
  id: number;
  country: string;
  city: string;
  address: string;
  hours?: string;
  phone?: string;
  email?: string;
  image?: string;
  map_url?: string;
  show_map_button?: boolean;
  is_active: boolean;
  sort_order: number;
}
