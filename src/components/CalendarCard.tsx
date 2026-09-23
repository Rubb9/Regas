import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES_ES } from '../utils/formatters.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface CalendarCardProps {
  currentYear: number;
  currentMonth: number; // 0-indexed (8 = September)
  selectedDate: string; // YYYY-MM-DD
  daysWithExpenses: Set<number>;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetToday?: () => void;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  currentYear,
  currentMonth,
  selectedDate,
  daysWithExpenses,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const monthName = MONTH_NAMES_ES[currentMonth];

  // Calculate calendar days
  const firstDayObj = new Date(currentYear, currentMonth, 1);
  let startingDayOfWeek = firstDayObj.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6

  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const [selY, selM, selD] = selectedDate.split('-').map(Number);
  const isSelectedInThisMonth = selY === currentYear && selM - 1 === currentMonth;

  // Day names: L (Lunes), M (Martes), X (Miércoles), J (Jueves), V (Viernes), S (Sábado), D (Domingo)
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
  }

  const handleDayClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onSelectDate(`${currentYear}-${formattedMonth}-${formattedDay}`);
  };

  return (
    <div
      className={`rounded-[28px] p-5 sm:p-6 transition-all duration-300 ${
        isDark
          ? 'glass-panel-dark text-white'
          : 'glass-panel-light text-slate-800'
      }`}
    >
      {/* Header Month / Year */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-all ${
            isDark
              ? 'hover:bg-white/10 text-white'
              : 'hover:bg-white/70 text-slate-700'
          }`}
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h2
          className={`text-xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {monthName} {currentYear}
        </h2>

        <button
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-all ${
            isDark
              ? 'hover:bg-white/10 text-white'
              : 'hover:bg-white/70 text-slate-700'
          }`}
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Week day initials */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {weekDays.map((dayName, idx) => (
          <div
            key={idx}
            className={`text-xs font-bold py-1 ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar numbers grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 sm:gap-x-2 text-center">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="w-10 h-10 mx-auto" />;
          }

          const hasExpense = daysWithExpenses.has(day);
          const isSelected = isSelectedInThisMonth && selD === day;

          // Stylings tailored to the reference screenshot
          let buttonStyle = isDark
            ? 'text-slate-200 hover:bg-white/10'
            : 'text-slate-700 hover:bg-white/70';

          if (isDark) {
            if (isSelected && hasExpense) {
              buttonStyle =
                'bg-white text-slate-950 font-black shadow-xl ring-4 ring-blue-500/40 scale-105';
            } else if (isSelected) {
              buttonStyle =
                'bg-white text-slate-950 font-black shadow-xl scale-105';
            } else if (hasExpense) {
              buttonStyle =
                'bg-[#2563EB] text-white font-bold shadow-md hover:bg-blue-600';
            }
          } else {
            // Light mode
            if (isSelected && hasExpense) {
              buttonStyle =
                'bg-slate-950 text-white font-black shadow-lg ring-4 ring-white scale-105';
            } else if (isSelected) {
              buttonStyle =
                'bg-white text-slate-950 font-black shadow-lg ring-2 ring-slate-900/10 scale-105';
            } else if (hasExpense) {
              buttonStyle =
                'bg-slate-900 text-white font-bold shadow-sm hover:bg-slate-800';
            }
          }

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDayClick(day)}
              className={`w-10 h-10 sm:w-11 sm:h-11 mx-auto flex flex-col items-center justify-center rounded-full text-sm transition-all duration-150 active:scale-95 ${buttonStyle}`}
            >
              <span>{day}</span>
              {hasExpense && !isSelected && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isDark ? 'bg-blue-300' : 'bg-slate-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
