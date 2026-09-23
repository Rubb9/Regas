export type CategoryType = 
  | 'supermercado'
  | 'transporte'
  | 'alimentacion'
  | 'hogar'
  | 'salud'
  | 'entretenimiento'
  | 'servicios'
  | 'educacion'
  | 'ropa'
  | 'otro';

export interface Category {
  id: CategoryType;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  budget?: number;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface VirtualReceipt {
  id: string;
  merchantName: string;
  date: string;
  time?: string;
  cashier?: string;
  address?: string;
  clientName?: string;
  ruc?: string;
  items: ReceiptItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  category?: CategoryType;
  realPhotoUrl?: string;
  backgroundTheme?: 'meadow' | 'minimal' | 'paper' | 'gradient';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: CategoryType;
  paymentMethod?: 'efectivo' | 'debito' | 'credito' | 'transferencia';
  tags?: string[];
  notes?: string;
  receiptUrl?: string;
  virtualReceipt?: VirtualReceipt;
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  notes?: string;
  createdAt: number;
}

export type ActiveTab = 'inicio' | 'gastos' | 'estadisticas' | 'categorias' | 'ahorro' | 'mas';

export type ThemeMode = 'light' | 'dark';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
}
