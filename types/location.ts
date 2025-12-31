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
  is_active: boolean;
  sort_order: number;
}
