// src/types.ts
export type RoleType = "CUSTOMER" | "STAFF" | "ADMIN";

export interface LoginRequest {
  userName: string; // email hoặc phone
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
}


export interface RegisterRequest {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  token: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemDTO {
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponseDTO {
  id: number;
  customerName: string;
  userName: string;
  phone: string;
  address: string;
  note: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string; // ISO format
  items: OrderItemDTO[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page
}