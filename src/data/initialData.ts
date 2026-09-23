import { Category, Expense, SavingsGoal, Income } from '../types.ts';

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
    title: 'Gran Aki Cayambe',
    amount: 22.55,
    date: '2026-09-08',
    category: 'supermercado',
    paymentMethod: 'debito',
    notes: 'Factura con 12 productos digitalizados',
    virtualReceipt: {
      id: 'rec-gran-aki',
      merchantName: 'GRAN AKi CAYAMBE',
      date: '08/09/2026',
      time: '02:46 PM',
      cashier: 'Caja: B001',
      address: 'Av. General Enríquez Vía Cotogchoa / Cayambe - Ecuador',
      clientName: 'IMBACUAN ALPALA MARIA ESTHER',
      ruc: '1790016919001',
      items: [
        { id: '01', name: 'DETODITO NATURAL', quantity: 2, unitPrice: 0.61, totalPrice: 1.22 },
        { id: '02', name: 'RUFFLES PICANTE', quantity: 2, unitPrice: 0.47, totalPrice: 0.94 },
        { id: '03', name: 'RUFFLES CREMA Y CE', quantity: 2, unitPrice: 0.47, totalPrice: 0.94 },
        { id: '04', name: 'RUFFLES TWIST LIMO', quantity: 2, unitPrice: 0.47, totalPrice: 0.94 },
        { id: '05', name: 'PA FRITAS SABOR LI', quantity: 3, unitPrice: 0.63, totalPrice: 1.90 },
        { id: '06', name: 'PA FRITAS SABOR A', quantity: 3, unitPrice: 0.63, totalPrice: 1.90 },
        { id: '07', name: 'DETODITO QUESO', quantity: 1, unitPrice: 0.59, totalPrice: 0.59 },
        { id: '08', name: 'CIELO AGUA SIN GAS', quantity: 6, unitPrice: 0.27, totalPrice: 1.63 },
        { id: '09', name: 'GUITIG', quantity: 6, unitPrice: 0.50, totalPrice: 3.03 },
        { id: '10', name: 'CAFFE LATO TONI MO', quantity: 3, unitPrice: 0.78, totalPrice: 2.35 },
        { id: '11', name: 'PACK PULP DURAZNO', quantity: 1, unitPrice: 1.78, totalPrice: 1.78 },
        { id: '12', name: 'PACK GELATONI', quantity: 1, unitPrice: 2.38, totalPrice: 2.38 },
      ],
      subtotal: 19.61,
      taxRate: 15,
      taxAmount: 2.94,
      totalAmount: 22.55,
      currency: 'USD',
      category: 'supermercado',
      backgroundTheme: 'meadow',
    },
    tags: ['Super', 'Víveres'],
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
    tags: ['Farmacia', 'Salud'],
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
    tags: ['Gasolina', 'Auto'],
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
    tags: ['Desayuno'],
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
    tags: ['Quincena', 'Hogar'],
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

export const getCategoryById = (categoryId?: string): Category => {
  if (!categoryId) {
    return CATEGORIES[CATEGORIES.length - 1]; // 'otro'
  }
  const cleanId = categoryId.toLowerCase().trim();
  const found = CATEGORIES.find(
    (c) => c.id.toLowerCase() === cleanId || c.name.toLowerCase() === cleanId
  );
  if (found) return found;

  const partial = CATEGORIES.find(
    (c) =>
      c.id.toLowerCase().includes(cleanId) ||
      cleanId.includes(c.id.toLowerCase()) ||
      c.name.toLowerCase().includes(cleanId) ||
      cleanId.includes(c.name.toLowerCase())
  );
  if (partial) return partial;

  return {
    id: 'otro',
    name: categoryId,
    iconName: 'Tag',
    color: '#64748B',
    bgColor: '#F1F5F9',
    budget: 50,
  };
};

export const INITIAL_INCOMES: Income[] = [

  {
    id: 'inc-1',
    title: 'Sueldo / Nómina Principal',
    amount: 450.44,
    date: '2026-09-01',
    category: 'Sueldo',
    createdAt: 1788220800000,
  },
  {
    id: 'inc-2',
    title: 'Proyecto Freelance',
    amount: 350.00,
    date: '2026-08-10',
    category: 'Freelance',
    createdAt: 1786406400000,
  },
  {
    id: 'inc-3',
    title: 'Ingreso Extra / Venta',
    amount: 120.00,
    date: '2026-07-20',
    category: 'Otros',
    createdAt: 1784678400000,
  },
  {
    id: 'inc-4',
    title: 'Nómina Junio',
    amount: 1150.00,
    date: '2026-06-15',
    category: 'Sueldo',
    createdAt: 1781520000000,
  },
  {
    id: 'inc-5',
    title: 'Nómina Mayo',
    amount: 980.00,
    date: '2026-05-15',
    category: 'Sueldo',
    createdAt: 1778928000000,
  },
  {
    id: 'inc-6',
    title: 'Nómina Abril',
    amount: 920.00,
    date: '2026-04-15',
    category: 'Sueldo',
    createdAt: 1776336000000,
  },
  {
    id: 'inc-7',
    title: 'Nómina Marzo',
    amount: 890.00,
    date: '2026-03-15',
    category: 'Sueldo',
    createdAt: 1773744000000,
  },
  {
    id: 'inc-8',
    title: 'Nómina Febrero',
    amount: 850.00,
    date: '2026-02-15',
    category: 'Sueldo',
    createdAt: 1771152000000,
  },
  {
    id: 'inc-9',
    title: 'Nómina Enero',
    amount: 800.00,
    date: '2026-01-15',
    category: 'Sueldo',
    createdAt: 1768560000000,
  }
];
