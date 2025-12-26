
import { MenuItem } from './types';

export const CATEGORIES = [
  'All',
  'Shawarma',
  'Pizza',
  'Grill',
  'Platter',
  'Sides',
  'Drinks'
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 's1', name: 'Chicken Shawarma', price: 5.50, category: 'Shawarma', image: 'https://picsum.photos/seed/shaw1/300/200' },
  { id: 's2', name: 'Beef Shawarma', price: 6.00, category: 'Shawarma', image: 'https://picsum.photos/seed/shaw2/300/200' },
  { id: 'p1', name: 'Margherita Pizza', price: 8.50, category: 'Pizza', image: 'https://picsum.photos/seed/pizza1/300/200' },
  { id: 'p2', name: 'Pepperoni Pizza', price: 10.00, category: 'Pizza', image: 'https://picsum.photos/seed/pizza2/300/200' },
  { id: 'g1', name: 'Mixed Grill', price: 15.00, category: 'Grill', image: 'https://picsum.photos/seed/grill1/300/200' },
  { id: 'g2', name: 'Kebab Platter', price: 12.00, category: 'Platter', image: 'https://picsum.photos/seed/grill2/300/200' },
  { id: 'sd1', name: 'French Fries', price: 3.00, category: 'Sides', image: 'https://picsum.photos/seed/side1/300/200' },
  { id: 'sd2', name: 'Hummus', price: 4.50, category: 'Sides', image: 'https://picsum.photos/seed/side2/300/200' },
  { id: 'd1', name: 'Coca Cola', price: 1.50, category: 'Drinks', image: 'https://picsum.photos/seed/drink1/300/200' },
  { id: 'd2', name: 'Fresh Juice', price: 3.50, category: 'Drinks', image: 'https://picsum.photos/seed/drink2/300/200' },
  { id: 'p3', name: 'Veggie Pizza', price: 9.00, category: 'Pizza', image: 'https://picsum.photos/seed/pizza3/300/200' },
  { id: 'g3', name: 'Lamb Chops', price: 18.00, category: 'Grill', image: 'https://picsum.photos/seed/grill3/300/200' },
  { id: 's3', name: 'Falafel Wrap', price: 4.50, category: 'Shawarma', image: 'https://picsum.photos/seed/shaw3/300/200' },
];

export const TABLES = Array.from({ length: 30 }, (_, i) => `T${i + 1}`);
export const USERS = ['user1', 'user2', 'user3', 'admin'];
export const COMPANY_PHONE = '+96475013234456';
