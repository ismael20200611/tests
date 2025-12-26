
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export enum OrderType {
  TAKE_AWAY = 'Take-away',
  DINE_IN = 'Dine-in'
}

export interface Order {
  id: string;
  date: string;
  time: string;
  type: OrderType;
  items: CartItem[];
  subtotal: number;
  grandTotal: number;
  customerDetails?: {
    name?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    user?: string;
    table?: string;
    vipCount?: number;
  };
}
