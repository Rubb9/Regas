import React, { useState, useMemo } from 'react';
import { Search, Plus, Tag, Download, Sparkles } from 'lucide-react';
import { CATEGORIES, getCategoryById } from '../data/initialData.ts';
import { Expense, VirtualReceipt } from '../types.ts';
import { formatCurrency, formatDateSpanish } from '../utils/formatters.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { CategoryIcon } from './CategoryIcon.tsx';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return expenses
      .filter((item) => {
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
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
      <div
        className={`rounded-3xl p-5 border flex items-center justify-between transition-all ${
          isDark
            ? 'glass-panel-dark text-white'
            : 'glass-panel-light text-slate-900'
        }`}
      >
        <div>
          <span
            className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Total en lista
          </span>
          <h2
            className={`text-2xl font-black tabular-nums ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {formatCurrency(totalFilteredAmount, currencySymbol)}
          </h2>
          <span
            className={`text-xs font-semibold ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {filteredExpenses.length} transacción{filteredExpenses.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            title="Exportar a CSV"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-all ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700 shadow-xs'
            }`}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onAddNewExpense}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-black text-xs transition-all shadow-md active:scale-95 ${
              isDark
                ? 'bg-white hover:bg-slate-100 text-slate-950'
                : 'bg-slate-950 hover:bg-slate-900 text-white'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3.5 top-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Buscar por comercio o nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isDark
                ? 'glass-panel-dark text-white placeholder:text-slate-400 focus:bg-white/15'
                : 'glass-panel-light text-slate-900 placeholder:text-slate-400 focus:bg-white/90'
            }`}
          />
        </div>

        {/* Category horizontal filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? isDark
                  ? 'bg-white text-slate-950 shadow-md font-black'
                  : 'bg-slate-950 text-white shadow-xs font-black'
                : isDark
                ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-white text-slate-950 shadow-md font-black'
                      : 'bg-slate-950 text-white shadow-xs font-black'
                    : isDark
                    ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                    : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className={`flex items-center justify-between px-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <span className="font-semibold">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`bg-transparent font-bold focus:outline-none cursor-pointer ${
              isDark ? 'text-blue-300' : 'text-slate-900'
            }`}
          >
            <option value="date-desc" className={isDark ? 'bg-[#0E1A33] text-white' : ''}>Más recientes primero</option>
            <option value="date-asc" className={isDark ? 'bg-[#0E1A33] text-white' : ''}>Más antiguos primero</option>
            <option value="amount-desc" className={isDark ? 'bg-[#0E1A33] text-white' : ''}>Mayor monto</option>
            <option value="amount-asc" className={isDark ? 'bg-[#0E1A33] text-white' : ''}>Menor monto</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredExpenses.length === 0 ? (
        <div
          className={`rounded-3xl p-8 text-center border my-4 ${
            isDark
              ? 'glass-panel-dark text-white'
              : 'glass-panel-light text-slate-800'
          }`}
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <p className="text-sm font-black">No se encontraron gastos</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Intenta con otro término de búsqueda o categoría
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
            const catInfo = getCategoryById(expense.category);

            return (
              <div
                key={expense.id}
                onClick={() => onSelectExpense(expense)}
                className={`rounded-2xl p-4 border transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-[0.99] group ${
                  isDark
                    ? 'glass-panel-dark glass-panel-dark-hover text-white'
                    : 'glass-panel-light glass-panel-light-hover text-slate-900'
                }`}
              >
                {/* Left: Category Icon and title/date/tags */}
                <div className="flex items-center min-w-0 pr-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mr-3.5 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
                    style={{
                      backgroundColor: isDark ? `${catInfo.color}30` : catInfo.bgColor,
                      color: catInfo.color,
                      border: `1.5px solid ${isDark ? `${catInfo.color}60` : `${catInfo.color}35`}`,
                    }}
                  >
                    <CategoryIcon name={catInfo.iconName} className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[0.95rem] font-bold truncate leading-snug">
                      {expense.title}
                    </h4>
                    <div className="flex items-center flex-wrap gap-2 mt-0.5">
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                        {formatDateSpanish(expense.date)}
                      </span>
                      {expense.virtualReceipt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewVirtualReceipt && expense.virtualReceipt) {
                              onViewVirtualReceipt(expense.virtualReceipt);
                            }
                          }}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                            isDark
                              ? 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Ticket</span>
                        </button>
                      )}
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {expense.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                isDark
                                  ? 'bg-white/10 text-slate-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              #{tag.replace(/^#/, '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Visual Category Tag Badge */}
                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className="text-base font-black tabular-nums tracking-tight">
                    -{formatCurrency(expense.amount, currencySymbol)}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-[10.5px] font-black tracking-tight shadow-2xs transition-all"
                    style={{
                      backgroundColor: isDark ? `${catInfo.color}30` : catInfo.bgColor,
                      color: isDark ? '#F1F5F9' : catInfo.color,
                      border: `1px solid ${isDark ? `${catInfo.color}55` : `${catInfo.color}40`}`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: catInfo.color }}
                    />
                    <span>{catInfo.name}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
