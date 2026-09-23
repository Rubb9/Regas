import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES_ES } from '../utils/formatters.ts';

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
  const monthName = MONTH_NAMES_ES[currentMonth];

  // Calculate calendar days
  // First day of month
  const firstDayObj = new Date(currentYear, currentMonth, 1);
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday = 0, Sunday = 6
  let startingDayOfWeek = firstDayObj.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6

  // Total days in month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Parse selected day if it belongs to this month and year
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
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 transition-all">
      {/* Header Month / Year */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">
          {monthName} {currentYear}
        </h2>

        <button
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Week day initials */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {weekDays.map((dayName, idx) => (
          <div
            key={idx}
            className="text-xs font-semibold text-slate-400 py-1"
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

          // Style definitions matching the screenshot:
          // - Days with expenses: bold bright blue filled circle (#2563EB) with white text
          // - Selected day (if not filled): prominent blue outline with blue text
          // - Selected day (if has expense): blue filled circle with subtle outer focus ring
          // - Regular day: soft round hover, slate-700 text

          let buttonStyle = 'text-slate-700 hover:bg-slate-100';

          if (hasExpense && isSelected) {
            buttonStyle = 'bg-blue-600 text-white font-bold ring-4 ring-blue-100 shadow-sm';
          } else if (hasExpense) {
            buttonStyle = 'bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700';
          } else if (isSelected) {
            buttonStyle = 'border-2 border-blue-600 text-blue-600 font-bold bg-blue-50/40';
          }

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDayClick(day)}
              className={`w-10 h-10 sm:w-11 sm:h-11 mx-auto flex items-center justify-center rounded-full text-sm transition-all duration-150 active:scale-95 ${buttonStyle}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
