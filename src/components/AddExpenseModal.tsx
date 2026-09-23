import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Trash2, Check, CreditCard, DollarSign, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/initialData.ts';
import { Expense, CategoryType } from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

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
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('supermercado');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('debito');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setPaymentMethod(initialExpense.paymentMethod || 'debito');
      setNotes(initialExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('supermercado');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setPaymentMethod('debito');
      setNotes('');
    }
    setError('');
  }, [initialExpense, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Por favor ingresa el nombre o establecimiento');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }
    if (!date) {
      setError('Por favor selecciona una fecha');
      return;
    }

    onSaveExpense(
      {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
        receiptUrl: initialExpense?.receiptUrl,
        virtualReceipt: initialExpense?.virtualReceipt,
      },
      initialExpense?.id
    );

    onClose();
  };

  const isEditing = Boolean(initialExpense?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {initialExpense?.virtualReceipt && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="truncate">Factura Virtual disponible</p>
                <p className="text-[10px] text-blue-600 font-normal">
                  {initialExpense.virtualReceipt.items.length} productos desglosados
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenVirtualReceipt && onOpenVirtualReceipt(initialExpense.virtualReceipt)}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs active:scale-95 transition-all shrink-0 ml-2"
            >
              Ver Factura →
            </button>
          </div>
        )}

        {error && (
          <div className="my-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Big Amount Input */}
          <div className="bg-blue-50/70 p-4 rounded-2xl text-center border border-blue-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Monto del Gasto
            </span>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-extrabold text-blue-600 mr-1.5">
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
                className="text-4xl font-extrabold text-slate-900 bg-transparent text-center focus:outline-none w-48 tabular-nums placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Title / Merchant */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Comercio / Descripción
            </label>
            <input
              type="text"
              placeholder="Ej. Gran Aki, Gasolina, Almuerzo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Fecha de la compra
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-10"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all active:scale-[0.98] border ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/90 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                    paymentMethod === method.id
                      ? 'bg-slate-900 text-white shadow-sm'
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nota adicional (opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles sobre este gasto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            {isEditing && onDeleteExpense && initialExpense && (
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(initialExpense.id);
                  onClose();
                }}
                className="w-12 h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center shrink-0 active:scale-95 transition-all"
                title="Eliminar gasto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Gasto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
