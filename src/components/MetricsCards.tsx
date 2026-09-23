import React from 'react';
import { Calendar, Wallet, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface MetricsCardsProps {
  daysWithPurchases: number;
  totalMonth: number;
  highestPurchase: number;
  currencySymbol?: string;
  onCardClick?: (metricType: 'days' | 'total' | 'highest') => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  daysWithPurchases,
  totalMonth,
  highestPurchase,
  currencySymbol = '$',
  onCardClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-4">
      {/* Card 1: Días con compras */}
      <div
        onClick={() => onCardClick && onCardClick('days')}
        className={`cursor-pointer transition-all duration-200 rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col justify-between min-h-[148px] sm:min-h-[160px] active:scale-[0.98] ${
          isDark
            ? 'glass-panel-dark glass-panel-dark-hover text-white'
            : 'glass-panel-light glass-panel-light-hover text-slate-800'
        }`}
      >
        <span
          className={`text-xs sm:text-sm font-bold leading-tight ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Días con<br />compras
        </span>
        <div className="my-1">
          <span
            className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {daysWithPurchases}
          </span>
        </div>
        <div>
          <Calendar
            className={`w-5 h-5 stroke-[2.2] ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Card 2: Total del mes (Hero Card matching reference screenshot focus card) */}
      <div
        onClick={() => onCardClick && onCardClick('total')}
        className={`cursor-pointer transition-all duration-200 rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col justify-between min-h-[148px] sm:min-h-[160px] active:scale-[0.98] ${
          isDark
            ? 'bg-white/95 text-slate-950 shadow-2xl hover:bg-white border border-white/50 backdrop-blur-xl'
            : 'bg-slate-950/90 text-white shadow-xl shadow-slate-950/20 hover:bg-slate-950 border border-slate-700/60 backdrop-blur-xl'
        }`}
      >
        <span
          className={`text-xs sm:text-sm font-bold leading-tight ${
            isDark ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          Total del mes
        </span>
        <div className="my-1">
          <span
            className={`text-2xl sm:text-[1.85rem] font-black tabular-nums tracking-tight ${
              isDark ? 'text-slate-950' : 'text-white'
            }`}
          >
            {formatCurrency(totalMonth, currencySymbol)}
          </span>
        </div>
        <div>
          <Wallet
            className={`w-5 h-5 stroke-[2.2] ${
              isDark ? 'text-slate-950' : 'text-white'
            }`}
          />
        </div>
      </div>

      {/* Card 3: Compra más alta */}
      <div
        onClick={() => onCardClick && onCardClick('highest')}
        className={`cursor-pointer transition-all duration-200 rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col justify-between min-h-[148px] sm:min-h-[160px] active:scale-[0.98] ${
          isDark
            ? 'glass-panel-dark glass-panel-dark-hover text-white'
            : 'glass-panel-light glass-panel-light-hover text-slate-800'
        }`}
      >
        <span
          className={`text-xs sm:text-sm font-bold leading-tight ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Compra<br />más alta
        </span>
        <div className="my-1">
          <span
            className={`text-2xl sm:text-[1.85rem] font-black tabular-nums tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {formatCurrency(highestPurchase, currencySymbol)}
          </span>
        </div>
        <div>
          <BarChart3
            className={`w-5 h-5 stroke-[2.2] ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
