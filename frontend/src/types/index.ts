export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type NoteType = 'FOLLOW_UP' | 'MEETING' | 'CALL' | 'NOTE';

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED';
export type NotificationType = 'LOW_STOCK' | 'FOLLOW_UP' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  userId: string;
  note: string;
  type: NoteType;
  followUpDate?: string | null;
  createdAt: string;
  user?: {
    name: string;
    role: Role;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  address: string;
  city: string;
  type: CustomerType;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    salesChallans: number;
    notes: number;
  };
  notes?: CustomerNote[];
  salesChallans?: SalesChallan[];
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  barcode?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  warehouse?: Warehouse;
  inventoryLogs?: InventoryLog[];
}

export interface InventoryLog {
  id: string;
  productId: string;
  warehouseId: string;
  userId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  referenceNo?: string | null;
  createdAt: string;
  product?: { sku: string; name: string };
  warehouse?: { name: string; code: string };
  user?: { name: string; role: Role };
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  skuSnapshot: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface SalesChallan {
  id: string;
  challanNo: string;
  customerId: string;
  userId: string;
  status: ChallanStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { name: string; company?: string | null; email: string; address?: string; city?: string };
  user?: { name: string; email?: string; role?: Role };
  items?: SalesChallanItem[];
  _count?: { items: number };
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  entity: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface DashboardKpis {
  totalCustomers: number;
  totalProducts: number;
  inventoryValuation: number;
  todaySalesRevenue: number;
  pendingFollowUpsCount: number;
  lowStockCount: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistributionData {
  category: string;
  count: number;
  value: number;
}

export interface TopSellingProductData {
  sku: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DashboardAnalytics {
  kpis: DashboardKpis;
  charts: {
    monthlyRevenue: MonthlyRevenueData[];
    categoryDistribution: CategoryDistributionData[];
    topSellingProducts: TopSellingProductData[];
  };
  lowStockAlerts: Product[];
  recentActivities: ActivityLog[];
  recentChallans: SalesChallan[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: string;
}
