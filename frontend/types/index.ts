export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price_per_unit: number;
  unit: string;
  stock_quantity: number;
  province: number;
  city: number;
  seller_name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  mobile: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}
