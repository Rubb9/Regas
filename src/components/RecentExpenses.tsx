import React from 'react';
import { ChevronRight, Plus, Tag } from 'lucide-react';
import { Expense } from '../types.ts';
import { formatCurrency, formatDateSpanish } from '../utils/formatters.ts';

interface RecentExpensesProps {
  expenses: Expense[];
  currencySymbol?: string;
  selectedDate?: string;
  onViewAll: () => void;
  onSelectExpense: (expense: Expense) => void;
  onAddNewExpense: () => void;
  onClearDateFilter?: () => void;
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({
  expenses,
  currencySymbol = '$',
  selectedDate,
  onViewAll,
  onSelectExpense,
  onAddNewExpense,
  onClearDateFilter,
}) => {
  return (
    <div className="mt-6 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            {selectedDate ? 'Gastos de la fecha' : 'Gastos recientes'}
          </h3>
          {selectedDate && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-blue-600 font-medium">
                Filtrado por: {formatDateSpanish(selectedDate)}
              </span>
              {onClearDateFilter && (
                <button
                  onClick={onClearDateFilter}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Ver todos
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 px-2 -mr-2 rounded-lg hover:bg-blue-50"
        >
          <span>Ver todos</span>
          <ChevronRight className="w-4 h-4 ml-0.5 stroke-[2.5]" />
        </button>
      </div>

      {/* List */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm my-2">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
            <Tag className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            No hay gastos registrados en esta fecha
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Registra una compra o escanea un ticket para comenzar
          </p>
          <button
            onClick={onAddNewExpense}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar gasto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => onSelectExpense(expense)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-100 hover:shadow-md transition-all active:scale-[0.99] group"
            >
              {/* Left: Icon and merchant/date */}
              <div className="flex items-center min-w-0 pr-3">
                <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-blue-600 flex items-center justify-center shrink-0 mr-3.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Tag className="w-5 h-5 -rotate-45 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[0.95rem] font-bold text-slate-900 truncate leading-snug">
                    {expense.title}
                  </h4>
                  <span className="text-xs font-medium text-slate-400">
                    {formatDateSpanish(expense.date)}
                  </span>
                </div>
              </div>

              {/* Right: Amount & Chevron */}
              <div className="flex items-center shrink-0">
                <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums mr-1.5">
                  {formatCurrency(expense.amount, currencySymbol)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
