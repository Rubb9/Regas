import React from 'react';
import { CATEGORIES } from '../data/initialData.ts';
import { Expense } from '../types.ts';
import { formatCurrency, MONTH_NAMES_ES } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      <div
        className={`rounded-3xl p-5 border transition-all ${
          isDark
            ? 'glass-panel-dark text-white'
            : 'glass-panel-light text-slate-900'
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wider block ${
            isDark ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          Distribución por Categoría ({MONTH_NAMES_ES[currentMonth]} {currentYear})
        </span>
        <h2 className="text-2xl font-black tabular-nums mt-0.5">
          {formatCurrency(totalMonthSpent, currencySymbol)}
        </h2>

        {/* Multi-color segment bar */}
        {totalMonthSpent > 0 ? (
          <div className="h-3 w-full rounded-full flex overflow-hidden mt-3 bg-slate-200/50">
            {categoryStats
              .filter((c) => c.percentage > 0)
              .map((c) => (
                <div
                  key={c.id}
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: c.color,
                  }}
                  title={`${c.name}: ${c.percentage}%`}
                  className="h-full transition-all"
                />
              ))}
          </div>
        ) : (
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No hay gastos registrados en este mes todavía
          </p>
        )}
      </div>

      {/* Categories Breakdown List */}
      <div className="space-y-2.5">
        {categoryStats.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            className={`rounded-2xl p-4 border transition-all duration-200 active:scale-[0.99] cursor-pointer ${
              isDark
                ? 'glass-panel-dark glass-panel-dark-hover text-white'
                : 'glass-panel-light glass-panel-light-hover text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">{cat.name}</h3>
                  <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {cat.count} {cat.count === 1 ? 'gasto' : 'gastos'} ({cat.percentage}%)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black tabular-nums block">
                  {formatCurrency(cat.spent, currencySymbol)}
                </span>
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  Límite {formatCurrency(cat.budget, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Progress to budget */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cat.budgetPercent > 90 ? 'bg-rose-500' : 'bg-blue-500'
                }`}
                style={{ width: `${cat.budgetPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
