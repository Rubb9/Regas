import React from 'react';
import { Calendar, Wallet, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.ts';

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
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-4">
      {/* Card 1: Días con compras */}
      <div
        onClick={() => onCardClick && onCardClick('days')}
        className="bg-[#EDF4FF] hover:bg-[#E2EEFF] cursor-pointer transition-all rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col justify-between min-h-[148px] sm:min-h-[160px] active:scale-[0.98] border border-blue-100/50"
      >
        <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
          Días con<br />compras
        </span>
        <div className="my-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tabular-nums tracking-tight">
            {daysWithPurchases}
          </span>
        </div>
        <div>
          <Calendar className="w-5 h-5 text-slate-700 stroke-[2.2]" />
        </div>
      </div>

      {/* Card 2: Total del mes (Hero Primary) */}
      <div
        onClick={() => onCardClick && onCardClick('total')}
        className="bg-[#1D63ED] hover:bg-[#1A57D4] cursor-pointer transition-all rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col justify-between min-h-[148px] sm:min-h-[160px] text-white shadow-lg shadow-blue-500/25 active:scale-[0.98]"
      >
        <span className="text-xs sm:text-sm font-semibold text-blue-100 leading-tight">
          Total del mes
        </span>
        <div className="my-1">
          <span className="text-2xl sm:text-[1.85rem] font-extrabold text-white tabular-nums tracking-tight">
            {formatCurrency(totalMonth, currencySymbol)}
          </span>
        </div>
        <div>
          <Wallet className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* Card 3: Compra más alta */}
      <div
        onClick={() => onCardClick && onCardClick('highest')}
        className="bg-[#EDF4FF] hover:bg-[#E2EEFF] cursor-pointer transition-all rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col justify-between min-h-[148px] sm:min-h-[160px] active:scale-[0.98] border border-blue-100/50"
      >
        <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
          Compra<br />más alta
        </span>
        <div className="my-1">
          <span className="text-2xl sm:text-[1.85rem] font-extrabold text-[#0F172A] tabular-nums tracking-tight">
            {formatCurrency(highestPurchase, currencySymbol)}
          </span>
        </div>
        <div>
          <BarChart3 className="w-5 h-5 text-slate-700 stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
};
