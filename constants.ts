export const CATEGORIES = ['All', 'Shawarma', 'Pizza', 'Grill', 'Platter', 'Sides', 'Drinks'];

export const MENU_ITEMS = [
  { id: 1, name: 'Beef Shawarma', price: 6.50, category: 'Shawarma', img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Chicken Shawarma', price: 5.50, category: 'Shawarma', img: 'https://images.unsplash.com/photo-1633321702518-7feccaf0ad44?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Mix Shawarma', price: 7.00, category: 'Shawarma', img: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'Margherita Pizza', price: 10.00, category: 'Pizza', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=300&q=80' },
  { id: 5, name: 'Pepperoni Pizza', price: 12.50, category: 'Pizza', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80' },
  { id: 6, name: 'Vegetable Pizza', price: 11.00, category: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
  { id: 7, name: 'Lamb Kebab', price: 15.00, category: 'Grill', img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=300&q=80' },
  { id: 8, name: 'Chicken Shish', price: 13.00, category: 'Grill', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' },
  { id: 9, name: 'Mixed Grill', price: 20.00, category: 'Grill', img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=300&q=80' },
  { id: 10, name: 'Family Platter', price: 35.00, category: 'Platter', img: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=300&q=80' },
  { id: 11, name: 'Party Platter', price: 50.00, category: 'Platter', img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=300&q=80' },
  { id: 12, name: 'French Fries', price: 3.50, category: 'Sides', img: 'https://images.unsplash.com/photo-1630384066202-073c170e3c5d?auto=format&fit=crop&w=300&q=80' },
  { id: 13, name: 'Hummus', price: 4.00, category: 'Sides', img: 'https://images.unsplash.com/photo-1577906030558-8418ff4ed267?auto=format&fit=crop&w=300&q=80' },
  { id: 14, name: 'Coca Cola', price: 1.50, category: 'Drinks', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80' },
  { id: 15, name: 'Orange Juice', price: 2.50, category: 'Drinks', img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=300&q=80' },
];

export const TABLES = Array.from({ length: 30 }, (_, i) => `T${i + 1}`);
export const USERS = ['user1', 'user2', 'user3', 'admin'];
export const CONTACT_NUMBER = '+96877611327';
export const COMPANY_EMAIL = 'fastfood@gmail.com';