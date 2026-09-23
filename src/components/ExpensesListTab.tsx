import React, { useState, useMemo } from 'react';
import { Search, Plus, Tag, ArrowUpDown, Download, Filter, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/initialData.ts';
import { Expense, VirtualReceipt } from '../types.ts';
import { formatCurrency, formatDateSpanish } from '../utils/formatters.ts';

interface ExpensesListTabProps {
  expenses: Expense[];
  currencySymbol?: string;
  onSelectExpense: (expense: Expense) => void;
  onAddNewExpense: () => void;
  onViewVirtualReceipt?: (receipt: VirtualReceipt) => void;
}

export const ExpensesListTab: React.FC<ExpensesListTabProps> = ({
  expenses,
  currencySymbol = '$',
  onSelectExpense,
  onAddNewExpense,
  onViewVirtualReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchQuery, selectedCategory, sortBy]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const exportToCSV = () => {
    const headers = 'ID,Titulo,Monto,Fecha,Categoria,MetodoPago,Notas\n';
    const rows = filteredExpenses
      .map(
        (e) =>
          `"${e.id}","${e.title}",${e.amount},"${e.date}","${e.category}","${e.paymentMethod || ''}","${e.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mis_gastos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner with Total and Add button */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total en lista
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatCurrency(totalFilteredAmount, currencySymbol)}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {filteredExpenses.length} transacción{filteredExpenses.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            title="Exportar a CSV"
            className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onAddNewExpense}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por comercio o nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Category horizontal filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span className="font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-semibold text-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Más recientes primero</option>
            <option value="date-asc">Más antiguos primero</option>
            <option value="amount-desc">Mayor monto</option>
            <option value="amount-asc">Menor monto</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-800">
              No se encontraron gastos
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando los filtros o la búsqueda
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => onSelectExpense(expense)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center min-w-0 pr-3">
                <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-blue-600 flex items-center justify-center shrink-0 mr-3.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Tag className="w-5 h-5 -rotate-45 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[0.95rem] font-bold text-slate-900 truncate leading-snug">
                    {expense.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <span>{formatDateSpanish(expense.date)}</span>
                    <span>·</span>
                    <span className="capitalize">{expense.paymentMethod || 'debito'}</span>
                    {expense.virtualReceipt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewVirtualReceipt && expense.virtualReceipt) {
                            onViewVirtualReceipt(expense.virtualReceipt);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 transition-colors ml-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                        <span>Ver Factura</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                  {formatCurrency(expense.amount, currencySymbol)}
                </span>
                {expense.notes && (
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {expense.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
