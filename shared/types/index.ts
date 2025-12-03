// Shared types for both client and server

export type PizzaSizeName = "small" | "medium" | "large" | "xlarge";
export type CrustType = "thin" | "regular" | "thick" | "stuffed";
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type PaymentMethod = "cash" | "card" | "debit" | "credit";
export type UserRole =
  | "super_admin"
  | "restaurant_admin"
  | "reception"
  | "kitchen";

export interface User {
  id: string;
  username: string;
  full_name?: string;
  role: UserRole;
  created_by?: string;
  active: boolean;
  created_at: string;
  last_login?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name?: string;
  role: UserRole;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  category: "meat" | "veggie" | "cheese" | "sauce";
}

export interface PizzaSize {
  id: string;
  name: PizzaSizeName;
  displayName: string;
  basePrice: number;
}

export interface Crust {
  id: string;
  type: CrustType;
  displayName: string;
  priceModifier: number;
}

export interface CustomPizza {
  size: PizzaSizeName;
  crust: CrustType;
  toppings: string[]; // topping IDs
}

export interface MenuItem {
  id: string;
  name: string;
  category: "pizza" | "side" | "drink";
  price: number;
  description?: string;
}

export interface SpecialtyPizza {
  id: string;
  name: string;
  description: string;
  toppings: string;
  prices: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  category: string;
}

export interface ComboDeal {
  id: string;
  name: string;
  description: string;
  price: number;
  items: string;
  category: string;
}

export interface OrderItem {
  id: string;
  type: "custom_pizza" | "specialty_pizza" | "combo_deal" | "side" | "drink";
  name: string;
  price: number;
  quantity: number;
  size?: PizzaSizeName;
  customPizza?: CustomPizza;
  specialtyPizzaId?: string;
  comboId?: string;
  menuItemId?: string;
  itemData?: any;
  notes?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MenuData {
  sizes: PizzaSize[];
  crusts: Crust[];
  toppings: Topping[];
  sides: MenuItem[];
  drinks: MenuItem[];
  specialtyPizzas: SpecialtyPizza[];
  combos: ComboDeal[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
