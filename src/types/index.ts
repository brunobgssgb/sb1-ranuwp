export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  whatsappSecret?: string;
  whatsappAccount?: string;
  mercadopagoToken?: string;
  mercadopagoWebhook?: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
}

export interface App {
  id: string;
  userId: string;
  name: string;
  price: number;
  codesAvailable: number;
}

export interface Code {
  id: string;
  appId: string;
  code: string;
  used: boolean;
}

export interface SaleItem {
  appId: string;
  quantity: number;
  price: number;
  codes: string[];
}

export interface Sale {
  id: string;
  userId: string;
  customerId: string;
  items: SaleItem[];
  totalPrice: number;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
}