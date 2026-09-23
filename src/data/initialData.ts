import { Category, Expense, SavingsGoal } from '../types.ts';

export const CATEGORIES: Category[] = [
  { id: 'supermercado', name: 'Supermercado', iconName: 'ShoppingCart', color: '#2563EB', bgColor: '#EFF6FF', budget: 150 },
  { id: 'alimentacion', name: 'Alimentación', iconName: 'Utensils', color: '#EA580C', bgColor: '#FFF7ED', budget: 100 },
  { id: 'transporte', name: 'Transporte', iconName: 'Car', color: '#0284C7', bgColor: '#F0F9FF', budget: 80 },
  { id: 'hogar', name: 'Hogar', iconName: 'Home', color: '#16A34A', bgColor: '#F0FDF4', budget: 120 },
  { id: 'salud', name: 'Salud & Farmacia', iconName: 'HeartPulse', color: '#DC2626', bgColor: '#FEF2F2', budget: 50 },
  { id: 'entretenimiento', name: 'Entretenimiento', iconName: 'Film', color: '#9333EA', bgColor: '#FAF5FF', budget: 60 },
  { id: 'servicios', name: 'Servicios Básicos', iconName: 'Zap', color: '#CA8A04', bgColor: '#FEFCE8', budget: 90 },
  { id: 'ropa', name: 'Ropa & Calzado', iconName: 'Shirt', color: '#DB2777', bgColor: '#FDF2F8', budget: 70 },
  { id: 'educacion', name: 'Educación', iconName: 'GraduationCap', color: '#0D9488', bgColor: '#F0FDFA', budget: 80 },
  { id: 'otro', name: 'Otros Gastos', iconName: 'Tag', color: '#475569', bgColor: '#F1F5F9', budget: 40 },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Gran Aki',
    amount: 4.00,
    date: '2026-09-13',
    category: 'supermercado',
    paymentMethod: 'debito',
    notes: 'Snacks y bebidas',
    createdAt: 1789390800000,
  },
  {
    id: 'exp-2',
    title: 'Farmacia SanaSana',
    amount: 6.27,
    date: '2026-09-09',
    category: 'salud',
    paymentMethod: 'efectivo',
    notes: 'Medicamentos básicos',
    createdAt: 1789045200000,
  },
  {
    id: 'exp-3',
    title: 'Gasolinera Primax',
    amount: 30.00,
    date: '2026-09-03',
    category: 'transporte',
    paymentMethod: 'debito',
    notes: 'Tanque lleno para el mes',
    createdAt: 1788526800000,
  },
  {
    id: 'exp-4',
    title: 'Panadería La Unión',
    amount: 2.50,
    date: '2026-08-28',
    category: 'alimentacion',
    paymentMethod: 'efectivo',
    notes: 'Pan y café',
    createdAt: 1788008400000,
  },
  {
    id: 'exp-5',
    title: 'Supermaxi Compra Semanal',
    amount: 45.80,
    date: '2026-08-15',
    category: 'supermercado',
    paymentMethod: 'debito',
    notes: 'Víveres quincenales',
    createdAt: 1786885200000,
  }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'save-1',
    title: 'Fondo de Emergencia',
    targetAmount: 600,
    currentAmount: 380,
    deadline: '2026-12-31',
    color: '#2563EB',
    icon: 'ShieldCheck',
  },
  {
    id: 'save-2',
    title: 'Vacaciones Fin de Año',
    targetAmount: 400,
    currentAmount: 260,
    deadline: '2026-12-15',
    color: '#16A34A',
    icon: 'Palmtree',
  },
  {
    id: 'save-3',
    title: 'Renovación Laptop',
    targetAmount: 800,
    currentAmount: 450,
    deadline: '2027-03-30',
    color: '#9333EA',
    icon: 'Laptop',
  },
];
