import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Trash2,
  Check,
  Sparkles,
  Tag,
  Plus,
  ShoppingBag,
  Receipt,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CATEGORIES, getCategoryById } from '../data/initialData.ts';
import { Expense, CategoryType, ReceiptItem, VirtualReceipt } from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { formatCurrency } from '../utils/formatters.ts';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteExpense?: (id: string) => void;
  onOpenVirtualReceipt?: (virtualReceipt: any) => void;
  initialExpense?: Expense | null;
  defaultDate?: string;
  currencySymbol?: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  onDeleteExpense,
  onOpenVirtualReceipt,
  initialExpense,
  defaultDate,
  currencySymbol = '$',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Basic expense fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('supermercado');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('debito');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Products / Items breakdown
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [productName, setProductName] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [productPrice, setProductPrice] = useState('');

  // Digital Receipt generation options
  const [generateDigitalReceipt, setGenerateDigitalReceipt] = useState(true);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [cashier, setCashier] = useState('Caja 01');
  const [address, setAddress] = useState('');
  const [ruc, setRuc] = useState('');
  const [receiptTheme, setReceiptTheme] = useState<'meadow' | 'minimal' | 'paper' | 'gradient'>('meadow');

  const QUICK_TAG_SUGGESTIONS = ['Super', 'Alimentos', 'Trabajo', 'Hogar', 'Personal', 'Salidas', 'Urgente', 'Ahorro'];

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setPaymentMethod(initialExpense.paymentMethod || 'debito');
      setTags(initialExpense.tags || []);
      setNotes(initialExpense.notes || '');

      if (initialExpense.virtualReceipt) {
        setGenerateDigitalReceipt(true);
        setItems(initialExpense.virtualReceipt.items || []);
        setCashier(initialExpense.virtualReceipt.cashier || 'Caja 01');
        setAddress(initialExpense.virtualReceipt.address || '');
        setRuc(initialExpense.virtualReceipt.ruc || '');
        setReceiptTheme((initialExpense.virtualReceipt.backgroundTheme as any) || 'meadow');
      } else {
        setGenerateDigitalReceipt(true);
        setItems([]);
      }
    } else {
      setTitle('');
      setAmount('');
      setCategory('supermercado');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setPaymentMethod('debito');
      setTags([]);
      setNotes('');
      setItems([]);
      setGenerateDigitalReceipt(true);
      setCashier('Caja 01');
      setAddress('');
      setRuc('');
      setReceiptTheme('meadow');
    }
    setCustomTagInput('');
    setProductName('');
    setProductQty('1');
    setProductPrice('');
    setError('');
  }, [initialExpense, defaultDate, isOpen]);

  const toggleTag = (tagStr: string) => {
    const clean = tagStr.replace(/^#/, '').trim();
    if (!clean) return;
    setTags((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = customTagInput.replace(/^#/, '').trim();
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
      setCustomTagInput('');
    }
  };

  const handleAddProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim()) {
      return;
    }
    const qty = Math.max(1, parseFloat(productQty) || 1);
    const unitPriceNum = parseFloat(productPrice) || 0;
    const totalPriceNum = parseFloat((qty * unitPriceNum).toFixed(2));

    const newItem: ReceiptItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: productName.trim(),
      quantity: qty,
      unitPrice: unitPriceNum,
      totalPrice: totalPriceNum,
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    setProductName('');
    setProductQty('1');
    setProductPrice('');

    // If unit price was provided, auto-calculate total amount
    const sum = newItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    if (sum > 0) {
      setAmount(sum.toFixed(2));
    }
  };

  const handleRemoveProduct = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    const sum = updated.reduce((acc, curr) => acc + curr.totalPrice, 0);
    if (sum > 0) {
      setAmount(sum.toFixed(2));
    }
  };

  const buildVirtualReceipt = (parsedAmount: number): VirtualReceipt => {
    const subtotal = items.length > 0
      ? items.reduce((acc, curr) => acc + curr.totalPrice, 0)
      : parsedAmount;

    const receiptItems: ReceiptItem[] = items.length > 0
      ? items
      : [
          {
            id: `item-${Date.now()}-1`,
            name: title.trim() || 'Compra general',
            quantity: 1,
            unitPrice: parsedAmount,
            totalPrice: parsedAmount,
          },
        ];

    return {
      id: initialExpense?.virtualReceipt?.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      merchantName: title.trim() || 'Comercio',
      date: date || new Date().toISOString().split('T')[0],
      time: initialExpense?.virtualReceipt?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashier: cashier.trim() || 'Caja 01',
      address: address.trim() || undefined,
      ruc: ruc.trim() || undefined,
      category,
      items: receiptItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxRate: 0,
      taxAmount: 0,
      totalAmount: parsedAmount,
      currency: currencySymbol,
      backgroundTheme: receiptTheme,
    };
  };

  const handleSave = (openReceiptAfter: boolean = false) => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Por favor ingresa un comercio o descripción');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    const receiptToAttach = generateDigitalReceipt || items.length > 0
      ? buildVirtualReceipt(parsedAmount)
      : initialExpense?.virtualReceipt;

    onSaveExpense(
      {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date: date || new Date().toISOString().split('T')[0],
        paymentMethod,
        tags: tags.length > 0 ? tags : undefined,
        notes: notes.trim() || undefined,
        receiptUrl: initialExpense?.receiptUrl,
        virtualReceipt: receiptToAttach,
      },
      initialExpense?.id
    );

    onClose();

    if (openReceiptAfter && receiptToAttach && onOpenVirtualReceipt) {
      onOpenVirtualReceipt(receiptToAttach);
    }
  };

  const handlePreviewReceipt = () => {
    const parsedAmount = parseFloat(amount) || items.reduce((acc, curr) => acc + curr.totalPrice, 0) || 1;
    const previewReceipt = buildVirtualReceipt(parsedAmount);
    if (onOpenVirtualReceipt) {
      onClose();
      onOpenVirtualReceipt(previewReceipt);
    }
  };

  if (!isOpen) return null;

  const isEditing = Boolean(initialExpense?.id);
  const selectedCatObj = getCategoryById(category);
  const totalProductsSum = items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar transition-all backdrop-blur-2xl border ${
          isDark
            ? 'bg-[#0E1A33]/90 border-white/20 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]'
            : 'bg-white/90 border-white/90 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12),inset_0_1px_2px_rgba(255,255,255,1)]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-black">
                {isEditing ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {generateDigitalReceipt ? 'Con desglose y factura digital' : 'Registro manual estándar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {initialExpense?.virtualReceipt && (
          <div
            className={`mt-3 p-3 rounded-2xl flex items-center justify-between border ${
              isDark
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="truncate">Factura Virtual vinculada</p>
                <p className="text-[10px] opacity-80 font-normal">
                  {initialExpense.virtualReceipt.items.length} productos desglosados
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenVirtualReceipt && onOpenVirtualReceipt(initialExpense.virtualReceipt)}
              className="text-xs font-black text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition-all shrink-0 ml-2"
            >
              Ver Factura →
            </button>
          </div>
        )}

        {error && (
          <div className="my-3 p-3 bg-red-500/10 text-red-400 text-xs rounded-xl font-bold border border-red-500/20">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          className="py-4 space-y-4"
        >
          {/* Big Amount Input */}
          <div
            className={`p-4 rounded-2xl text-center border relative ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-blue-50/70 border-blue-100'
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Monto del Gasto
            </span>
            <div className="flex items-center justify-center">
              <span
                className={`text-3xl font-black mr-1.5 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus={!isEditing}
                className={`text-4xl font-black bg-transparent text-center focus:outline-none w-48 tabular-nums ${
                  isDark
                    ? 'text-white placeholder:text-slate-600'
                    : 'text-slate-900 placeholder:text-slate-300'
                }`}
              />
            </div>

            {items.length > 0 && totalProductsSum > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Suma de productos:
                </span>
                <span className="font-bold text-emerald-500 tabular-nums">
                  {formatCurrency(totalProductsSum, currencySymbol)}
                </span>
                {parseFloat(amount) !== totalProductsSum && (
                  <button
                    type="button"
                    onClick={() => setAmount(totalProductsSum.toFixed(2))}
                    className="ml-1 text-[10px] font-black text-blue-500 hover:underline"
                  >
                    (Sincronizar)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title / Merchant */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Comercio o Lugar de Compra
            </label>
            <input
              type="text"
              placeholder="Ej. Supermaxi, Gran Aki, Cafetería, Gasolinera..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Fecha de la compra
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-10 ${
                  isDark
                    ? 'bg-white/10 border border-white/20 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* NEW SECTION: PRODUCTS / ITEMS BREAKDOWN */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? 'bg-white/[0.04] border-white/15'
                : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <label className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Productos comprados ({items.length})
                </label>
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Desglose para factura
              </span>
            </div>
            <p className={`text-[11px] mb-3 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Agrega los artículos que compraste. Se incluirán de forma estética en la factura digital.
            </p>

            {/* Quick Add Product Row */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del producto (ej: Leche 1L, Manzanas...)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-500'
                      : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-24">
                  <div className="relative">
                    <span className="text-[10px] text-slate-400 absolute left-2 top-2 font-bold">Cant:</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={productQty}
                      onChange={(e) => setProductQty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddProduct();
                        }
                      }}
                      className={`w-full pl-9 pr-2 py-2 rounded-xl text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark
                          ? 'bg-white/10 border border-white/20 text-white'
                          : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="relative">
                    <span className="text-[11px] text-slate-400 absolute left-2.5 top-2 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Precio unitario"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddProduct();
                        }
                      }}
                      className={`w-full pl-6 pr-2 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark
                          ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-500'
                          : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddProduct()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {/* Added products list */}
            {items.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className={`text-[10.5px] tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.quantity} × {formatCurrency(item.unitPrice, currencySymbol)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black tabular-nums text-sm">
                        {formatCurrency(item.totalPrice, currencySymbol)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(item.id)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW SECTION: DIGITAL RECEIPT CREATION & PREVIEW */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? 'bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border-blue-500/30'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Crear Factura Digital Estética
                  </h4>
                  <p className={`text-[11px] ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    Diseño con flores, sello y desglose
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateDigitalReceipt}
                  onChange={(e) => setGenerateDigitalReceipt(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-400/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {generateDigitalReceipt && (
              <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowReceiptOptions(!showReceiptOptions)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600"
                  >
                    <span>Opciones de factura (RUC, cajero, sucursal)</span>
                    {showReceiptOptions ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePreviewReceipt}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-xs font-bold text-blue-600 dark:text-blue-300 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Previsualizar</span>
                  </button>
                </div>

                {showReceiptOptions && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Cajero / Vendedor
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Caja 03, Sandra P."
                          value={cashier}
                          onChange={(e) => setCashier(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            isDark
                              ? 'bg-white/10 border border-white/15 text-white placeholder:text-slate-500'
                              : 'bg-white border border-slate-300 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          RUC / Cédula (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 1790016919001"
                          value={ruc}
                          onChange={(e) => setRuc(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            isDark
                              ? 'bg-white/10 border border-white/15 text-white placeholder:text-slate-500'
                              : 'bg-white border border-slate-300 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Dirección o Sucursal (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Av. Panamericana Norte y Olmedo"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isDark
                            ? 'bg-white/10 border border-white/15 text-white placeholder:text-slate-500'
                            : 'bg-white border border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Categoría (Etiqueta principal)
              </label>
              {selectedCatObj && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-tight shadow-2xs animate-in fade-in duration-150"
                  style={{
                    backgroundColor: isDark ? `${selectedCatObj.color}35` : selectedCatObj.bgColor,
                    color: isDark ? '#F8FAFC' : selectedCatObj.color,
                    border: `1px solid ${isDark ? `${selectedCatObj.color}60` : `${selectedCatObj.color}45`}`,
                  }}
                >
                  <CategoryIcon name={selectedCatObj.iconName} className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{selectedCatObj.name}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={
                      isSelected
                        ? {
                            borderColor: cat.color,
                            backgroundColor: isDark ? `${cat.color}25` : cat.bgColor,
                          }
                        : undefined
                    }
                    className={`p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all active:scale-[0.98] border ${
                      isSelected
                        ? isDark
                          ? 'text-white font-black shadow-md'
                          : 'text-slate-950 font-black shadow-xs'
                        : isDark
                        ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Tags (#tags) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Etiquetas adicionales (#tags)
              </label>
              <span className={`text-[10.5px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Opcional
              </span>
            </div>

            {/* Quick tags pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_TAG_SUGGESTIONS.map((sug) => {
                const isTagActive = tags.includes(sug);
                return (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => toggleTag(sug)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                      isTagActive
                        ? isDark
                          ? 'bg-blue-500 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : isDark
                        ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    #{sug}
                  </button>
                );
              })}
            </div>

            {/* Input to add custom tags */}
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Agregar etiqueta personalizada (ej: Almuerzo, Uber)..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomTag}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-white/15 hover:bg-white/25 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                + Añadir
              </button>
            </div>

            {/* Selected tags badges */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="hover:opacity-75 ml-0.5 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Método de pago
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'debito', label: 'Débito' },
                { id: 'efectivo', label: 'Efectivo' },
                { id: 'credito', label: 'Crédito' },
                { id: 'transferencia', label: 'Transf.' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as Expense['paymentMethod'])}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === method.id
                      ? isDark
                        ? 'bg-white text-slate-950 font-black shadow-sm'
                        : 'bg-slate-950 text-white font-black shadow-sm'
                      : isDark
                      ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nota adicional (opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles sobre este gasto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              {isEditing && onDeleteExpense && initialExpense && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteExpense(initialExpense.id);
                    onClose();
                  }}
                  className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  title="Eliminar gasto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {generateDigitalReceipt ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>Guardar y Ver Factura</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    className={`h-12 px-4 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    }`}
                  >
                    Solo Guardar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Registrar Gasto'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
