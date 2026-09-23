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

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: CategoryType;
  paymentMethod?: 'efectivo' | 'debito' | 'credito' | 'transferencia';
  notes?: string;
  receiptUrl?: string;
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

export type ActiveTab = 'inicio' | 'gastos' | 'categorias' | 'ahorro' | 'mas';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
}
