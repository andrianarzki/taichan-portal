export type MenuCategory = 'taichan' | 'side' | 'drink';
export type MenuType = 'portion' | 'unit';
export type PaymentMethod = 'CASH' | 'QRIS';
export type OrderStatus = 'ACTIVE' | 'DONE';
export type FilterPeriod = 'daily' | 'monthly' | 'yearly';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  type: MenuType;
  price: number;
  description: string;
  skewerCount?: number; // e.g. 10 for porsi, 1 for satuan
}

export interface OrderItem {
  menuId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  note?: string;
  category?: MenuCategory;
  skewerCount?: number;
}

export interface Order {
  id: string; // Format: #ORD-001, #ORD-002, etc.
  tableInfo: string; // e.g. "Meja 01", "Bungkus", etc.
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  synced: boolean;
  notes?: string;
}

export interface FinancialSummary {
  period: FilterPeriod;
  dateLabel: string;
  totalOmzet: number;
  totalTransactions: number;
  cashAmount: number;
  cashCount: number;
  cashPercent: number;
  qrisAmount: number;
  qrisCount: number;
  qrisPercent: number;
  averagePerTable: number;
  totalPortionsSold: number;
  growthPercentage: number;
}
