import React from 'react';
import { CATEGORIES } from '../data/initialData.ts';
import { Expense } from '../types.ts';
import { formatCurrency, MONTH_NAMES_ES } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface CategoriesTabProps {
  expenses: Expense[];
  currentMonth: number;
  currentYear: number;
  currencySymbol?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  expenses,
  currentMonth,
  currentYear,
  currencySymbol = '$',
  onSelectCategory,
}) => {
  // Filter expenses for current month & year
  const monthExpenses = expenses.filter((e) => {
    const [y, m] = e.date.split('-').map(Number);
    return y === currentYear && m - 1 === currentMonth;
  });

  const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryStats = CATEGORIES.map((cat) => {
    const catExpenses = monthExpenses.filter((e) => e.category === cat.id);
    const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalMonthSpent > 0 ? Math.round((spent / totalMonthSpent) * 100) : 0;
    const budget = cat.budget || 100;
    const budgetPercent = Math.min(100, Math.round((spent / budget) * 100));

    return {
      ...cat,
      spent,
      count: catExpenses.length,
      percentage,
      budget,
      budgetPercent,
    };
  }).sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Distribución por Categoría ({MONTH_NAMES_ES[currentMonth]} {currentYear})
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
          {formatCurrency(totalMonthSpent, currencySymbol)}
        </h2>

        {/* Multi-color segment bar */}
        {totalMonthSpent > 0 ? (
          <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden my-3">
            {categoryStats
              .filter((c) => c.spent > 0)
              .map((c) => (
                <div
                  key={c.id}
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: c.color,
                  }}
                  title={`${c.name}: ${c.percentage}%`}
                />
              ))}
          </div>
        ) : (
          <div className="w-full h-2.5 rounded-full bg-slate-100 my-3" />
        )}
      </div>

      {/* Category List with Budgets */}
      <div className="space-y-2.5">
        {categoryStats.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.bgColor, color: cat.color }}
                >
                  <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {cat.count} compra{cat.count !== 1 ? 's' : ''} {cat.spent > 0 ? `(${cat.percentage}%)` : ''}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-slate-900 tabular-nums block">
                  {formatCurrency(cat.spent, currencySymbol)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Presupuesto: {formatCurrency(cat.budget, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cat.budgetPercent}%`,
                  backgroundColor: cat.spent > cat.budget ? '#EF4444' : cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
