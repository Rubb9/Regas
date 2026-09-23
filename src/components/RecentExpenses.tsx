import React from 'react';
import { ChevronRight, Plus, Sparkles, Tag } from 'lucide-react';
import { Expense, VirtualReceipt } from '../types.ts';
import { formatCurrency, formatDateSpanish } from '../utils/formatters.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { CategoryIcon } from './CategoryIcon.tsx';
import { getCategoryById } from '../data/initialData.ts';

interface RecentExpensesProps {
  expenses: Expense[];
  currencySymbol?: string;
  selectedDate?: string;
  onViewAll: () => void;
  onSelectExpense: (expense: Expense) => void;
  onAddNewExpense: () => void;
  onClearDateFilter?: () => void;
  onViewVirtualReceipt?: (receipt: VirtualReceipt) => void;
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({
  expenses,
  currencySymbol = '$',
  selectedDate,
  onViewAll,
  onSelectExpense,
  onAddNewExpense,
  onClearDateFilter,
  onViewVirtualReceipt,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="mt-6 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3
            className={`text-xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {selectedDate ? 'Gastos de la fecha' : 'Gastos recientes'}
          </h3>
          {selectedDate && (
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-xs font-semibold ${
                  isDark ? 'text-blue-300' : 'text-slate-700'
                }`}
              >
                Filtrado: {formatDateSpanish(selectedDate)}
              </span>
              {onClearDateFilter && (
                <button
                  onClick={onClearDateFilter}
                  className={`text-xs font-medium underline ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Ver todos
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onViewAll}
          className={`flex items-center text-xs font-bold transition-all py-1.5 px-3 rounded-full ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white/60 hover:bg-white/80 text-slate-800'
          }`}
        >
          <span>Ver todos</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 stroke-[2.5]" />
        </button>
      </div>

      {/* List */}
      {expenses.length === 0 ? (
        <div
          className={`rounded-3xl p-6 text-center shadow-sm my-2 transition-all ${
            isDark
              ? 'glass-panel-dark text-white'
              : 'glass-panel-light text-slate-800'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isDark ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Tag className="w-6 h-6" />
          </div>
          <p
            className={`text-sm font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            No hay gastos registrados en esta fecha
          </p>
          <p
            className={`text-xs mt-1 mb-4 ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Registra una compra o escanea un ticket para comenzar
          </p>
          <button
            onClick={onAddNewExpense}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all shadow-md active:scale-95 ${
              isDark
                ? 'bg-white text-slate-950 hover:bg-slate-100'
                : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar gasto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((expense) => {
            const catInfo = getCategoryById(expense.category);

            return (
              <div
                key={expense.id}
                onClick={() => onSelectExpense(expense)}
                className={`rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-[0.99] group ${
                  isDark
                    ? 'glass-panel-dark glass-panel-dark-hover text-white'
                    : 'glass-panel-light glass-panel-light-hover text-slate-900'
                }`}
              >
                {/* Left: Category Icon and merchant/date/tags */}
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
                    <h4
                      className={`text-[0.95rem] font-bold truncate leading-snug ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {expense.title}
                    </h4>
                    <div className="flex items-center flex-wrap gap-2 mt-0.5">
                      <span
                        className={`text-xs font-semibold ${
                          isDark ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
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
                          {expense.tags.slice(0, 2).map((tag, idx) => (
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

                {/* Right: Amount and Visual Category Tag Badge */}
                <div className="text-right shrink-0 flex flex-col items-end">
                  <span
                    className={`text-base font-black tabular-nums tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
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
