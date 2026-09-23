import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Check, 
  X,
  Calendar
} from 'lucide-react';
import { Expense, Income } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface StatisticsTabProps {
  expenses: Expense[];
  incomes: Income[];
  currencySymbol: string;
  onAddIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  expenses,
  incomes,
  currencySymbol,
  onAddIncome,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filters:
  // 1. Selector "Gastos" vs "Ingresos"
  const [activeMetricType, setActiveMetricType] = useState<'gastos' | 'ingresos'>('gastos');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // 2. Period toggle: "Mes" vs "Año"
  const [periodType, setPeriodType] = useState<'mes' | 'año'>('mes');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  // Selected month for inspection (0 = Enero, 5 = Junio, etc. Default 5 = Junio)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Bottom trend metric toggle: "Ingresos" vs "Gastos"
  const [trendMetricType, setTrendMetricType] = useState<'ingresos' | 'gastos'>('ingresos');
  const [isTrendDropdownOpen, setIsTrendDropdownOpen] = useState(false);

  // Modal to add an income
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [newIncomeTitle, setNewIncomeTitle] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeCategory, setNewIncomeCategory] = useState('Sueldo');
  const [newIncomeDate, setNewIncomeDate] = useState('2026-06-15');

  // Tooltip hover on trend chart
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; value: number } | null>(null);

  const monthNamesShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthNamesFull = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Calculate monthly stats for selected month & year
  const monthlyData = useMemo(() => {
    // Filter expenses in selected month/year
    const monthExpenses = expenses.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      if (periodType === 'año') {
        return y === selectedYear;
      }
      return y === selectedYear && m === selectedMonthIndex + 1;
    });

    // Filter incomes in selected month/year
    const monthIncomes = incomes.filter((inc) => {
      const [y, m] = inc.date.split('-').map(Number);
      if (periodType === 'año') {
        return y === selectedYear;
      }
      return y === selectedYear && m === selectedMonthIndex + 1;
    });

    const totalGastos = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIngresos = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0);

    // Initial fallbacks if no transactions registered yet for the selected month:
    let displayIngresos = totalIngresos;
    let displayGastos = totalGastos;

    if (periodType === 'mes' && selectedMonthIndex === 5) {
      if (displayIngresos === 0) displayIngresos = 1150.00;
      if (displayGastos === 0) displayGastos = 230.66;
    } else if (displayIngresos === 0 && displayGastos === 0) {
      const sampleIncomesByMonth = [800, 850, 890, 920, 980, 1150, 750, 820, 450.44, 850, 900, 1200];
      const sampleExpensesByMonth = [210, 240, 195, 260, 215, 230.66, 180, 210, 205, 240, 260, 310];
      displayIngresos = sampleIncomesByMonth[selectedMonthIndex] || 0;
      displayGastos = sampleExpensesByMonth[selectedMonthIndex] || 0;
    }

    const balance = displayIngresos - displayGastos;

    // Group expenses by category
    const catMap: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      const cat = e.category || 'otro';
      catMap[cat] = (catMap[cat] || 0) + e.amount;
    });

    // Category breakdown
    let categoryBreakdown: Array<{ name: string; percentage: number; color: string; amount?: number }> = [];

    if (totalGastos > 0) {
      const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      categoryBreakdown = sorted.slice(0, 4).map(([cat, amt], idx) => {
        const pct = Math.round((amt / totalGastos) * 100);
        const colors = isDark 
          ? ['#60A5FA', '#38BDF8', '#F97316', '#94A3B8']
          : ['#2563EB', '#0284C7', '#EA580C', '#64748B'];
        const prettyNames: Record<string, string> = {
          hogar: 'Hogar',
          transporte: 'Transporte',
          supermercado: 'Supermercado',
          alimentacion: 'Comida',
          salud: 'Salud',
          entretenimiento: 'Entretenimiento',
          otro: 'Otros',
        };
        return {
          name: prettyNames[cat] || cat,
          percentage: pct,
          color: colors[idx % colors.length],
          amount: amt,
        };
      });
    }

    if (categoryBreakdown.length === 0) {
      categoryBreakdown = [
        { name: 'Hogar', percentage: 36, color: isDark ? '#60A5FA' : '#2563EB' },
        { name: 'Transporte', percentage: 24, color: isDark ? '#38BDF8' : '#0284C7' },
        { name: 'Comida', percentage: 27, color: '#EA580C' },
        { name: 'Otros', percentage: 14, color: isDark ? '#94A3B8' : '#64748B' },
      ];
    }

    // Pie chart distribution
    const grandSum = displayIngresos + displayGastos;
    let pieBreakdown = [
      { name: 'Ingresos', percentage: 48, color: '#10B981', amount: displayIngresos },
      { name: 'Gastos', percentage: 30, color: '#EF4444', amount: displayGastos },
      { name: 'Ahorros', percentage: 16, color: isDark ? '#60A5FA' : '#3B82F6', amount: Math.max(0, balance) },
    ];

    if (grandSum > 0 && selectedMonthIndex !== 5) {
      const ingP = Math.round((displayIngresos / grandSum) * 60);
      const gasP = Math.round((displayGastos / grandSum) * 40);
      const ahP = Math.max(10, 100 - (ingP + gasP));
      pieBreakdown = [
        { name: 'Ingresos', percentage: ingP, color: '#10B981', amount: displayIngresos },
        { name: 'Gastos', percentage: gasP, color: '#EF4444', amount: displayGastos },
        { name: 'Ahorros', percentage: ahP, color: isDark ? '#60A5FA' : '#3B82F6', amount: Math.max(0, balance) },
      ];
    }

    return {
      ingresos: displayIngresos,
      gastos: displayGastos,
      balance,
      categoryBreakdown,
      pieBreakdown,
      highestCatPercentage: categoryBreakdown[0]?.percentage || 36,
    };
  }, [expenses, incomes, selectedMonthIndex, selectedYear, periodType, isDark]);

  const isSecondSemester = selectedMonthIndex >= 6;
  const semesterIndices = isSecondSemester ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];

  const trendData = useMemo(() => {
    const monthlyValues = semesterIndices.map((mIdx) => {
      let val = 0;
      if (trendMetricType === 'ingresos') {
        const found = incomes
          .filter((inc) => {
            const [y, m] = inc.date.split('-').map(Number);
            return y === selectedYear && m === mIdx + 1;
          })
          .reduce((sum, inc) => sum + inc.amount, 0);

        const defaults = [800, 850, 890, 920, 980, 1150, 750, 820, 450.44, 850, 900, 1200];
        val = found > 0 ? found : defaults[mIdx];
      } else {
        const found = expenses
          .filter((e) => {
            const [y, m] = e.date.split('-').map(Number);
            return y === selectedYear && m === mIdx + 1;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        const defaults = [210, 240, 195, 260, 215, 230.66, 180, 210, 205, 240, 260, 310];
        val = found > 0 ? found : defaults[mIdx];
      }
      return {
        monthIndex: mIdx,
        label: monthNamesShort[mIdx],
        fullName: monthNamesFull[mIdx],
        value: val,
      };
    });

    const maxValue = Math.max(...monthlyValues.map((d) => d.value), 1);
    const minValue = Math.min(...monthlyValues.map((d) => d.value), 0);
    const activePoint = monthlyValues.find((p) => p.monthIndex === selectedMonthIndex) || monthlyValues[monthlyValues.length - 1];

    return {
      points: monthlyValues,
      max: maxValue,
      min: minValue,
      currentValue: activePoint.value,
    };
  }, [incomes, expenses, selectedYear, trendMetricType, semesterIndices, selectedMonthIndex]);

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newIncomeAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddIncome({
      title: newIncomeTitle.trim() || 'Ingreso',
      amount: parsedAmount,
      date: newIncomeDate,
      category: newIncomeCategory,
    });

    setNewIncomeTitle('');
    setNewIncomeAmount('');
    setShowAddIncomeModal(false);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between px-1">
        <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Estadísticas
        </h2>
      </div>

      {/* 2. TOP BALANCE CARD */}
      <div
        className={`rounded-3xl p-5 transition-all duration-300 relative overflow-hidden border ${
          isDark
            ? 'glass-panel-dark text-white'
            : 'glass-panel-light text-slate-900'
        }`}
      >
        <div className="space-y-2.5">
          {/* Row 1: Ingresos */}
          <div className="flex items-center justify-between">
            <span
              className={`text-base sm:text-lg font-bold tracking-wide font-sans ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              Ingresos
            </span>
            <span
              className={`text-xl sm:text-2xl font-black tabular-nums ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {formatCurrency(monthlyData.ingresos, currencySymbol)}
            </span>
          </div>

          {/* Row 2: Gastos */}
          <div
            className={`flex items-center justify-between border-t border-dashed pt-2.5 ${
              isDark ? 'border-white/15' : 'border-slate-200'
            }`}
          >
            <span
              className={`text-base sm:text-lg font-bold tracking-wide font-sans ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              Gastos
            </span>
            <span
              className={`text-xl sm:text-2xl font-black tabular-nums ${
                isDark ? 'text-rose-400' : 'text-rose-500'
              }`}
            >
              -{formatCurrency(monthlyData.gastos, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div
          className={`mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-white/15' : 'border-slate-200/80'
          }`}
        >
          <span
            className={`font-medium ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Balance disponible:
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`font-black tabular-nums ${
                monthlyData.balance >= 0
                  ? isDark
                    ? 'text-white'
                    : 'text-slate-900'
                  : isDark
                  ? 'text-rose-400'
                  : 'text-rose-600'
              }`}
            >
              {monthlyData.balance >= 0 ? '+' : ''}
              {formatCurrency(monthlyData.balance, currencySymbol)}
            </span>
            <button
              onClick={() => setShowAddIncomeModal(true)}
              className={`p-1 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-white/10 text-emerald-400'
                  : 'hover:bg-emerald-50 text-emerald-600'
              }`}
              title="Añadir ingreso"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. FILTERS ROW: [Gastos v] and [ Mes ▾ | Año ] */}
      <div className="flex items-center justify-between relative z-20 px-0.5">
        {/* Left: Dropdown pill [Gastos v] */}
        <div className="relative">
          <button
            onClick={() => {
              setIsTypeDropdownOpen(!isTypeDropdownOpen);
              setIsMonthDropdownOpen(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all active:scale-95 ${
              isDark
                ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                : 'bg-white/80 hover:bg-white border border-white/80 text-slate-800'
            }`}
          >
            <span className="capitalize">{activeMetricType}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isTypeDropdownOpen ? 'rotate-180' : ''
              } ${isDark ? 'text-white' : 'text-slate-600'}`}
            />
          </button>

          {/* Floating dropdown menu */}
          {isTypeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsTypeDropdownOpen(false)}
              />
              <div
                className={`absolute top-full left-0 mt-1.5 w-36 rounded-2xl p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-[#0E1A33] border border-white/15 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <button
                  onClick={() => {
                    setActiveMetricType('gastos');
                    setIsTypeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                    activeMetricType === 'gastos'
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-300'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Gastos</span>
                </button>
                <button
                  onClick={() => {
                    setActiveMetricType('ingresos');
                    setIsTypeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                    activeMetricType === 'ingresos'
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-300'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Ingresos</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Segmented toggle with MONTH SELECTOR DROPDOWN */}
        <div className="relative">
          <div
            className={`flex items-center p-1 rounded-full shadow-2xs ${
              isDark
                ? 'bg-black/40 border border-white/15'
                : 'bg-white/60 border border-white/80'
            }`}
          >
            {/* Mes Button with dropdown */}
            <button
              onClick={() => {
                if (periodType !== 'mes') {
                  setPeriodType('mes');
                }
                setIsMonthDropdownOpen(!isMonthDropdownOpen);
                setIsTypeDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                periodType === 'mes'
                  ? isDark
                    ? 'bg-white text-slate-950 font-black shadow-md'
                    : 'bg-white text-blue-600 shadow-xs border border-slate-200'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Escoger mes"
            >
              <span>{periodType === 'mes' ? monthNamesFull[selectedMonthIndex] : 'Mes'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMonthDropdownOpen && periodType === 'mes'
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>

            {/* Año Button */}
            <button
              onClick={() => {
                setPeriodType('año');
                setIsMonthDropdownOpen(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                periodType === 'año'
                  ? isDark
                    ? 'bg-white text-slate-950 font-black shadow-md'
                    : 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Año
            </button>
          </div>

          {/* Month Selection Popover Menu */}
          {isMonthDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsMonthDropdownOpen(false)}
              />
              <div
                className={`absolute top-full right-0 mt-2 w-64 rounded-3xl p-3 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-[#0E1A33] border border-white/20 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-800'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 mb-2 px-1 border-b ${
                    isDark ? 'border-white/10' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span>Seleccionar Mes</span>
                  </div>
                  <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    {selectedYear}
                  </span>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
                  {monthNamesFull.map((name, idx) => {
                    const isSelected = selectedMonthIndex === idx && periodType === 'mes';
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setSelectedMonthIndex(idx);
                          setPeriodType('mes');
                          setIsMonthDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-white text-slate-950 font-black shadow-md'
                              : 'bg-blue-600 text-white font-black shadow-xs'
                            : isDark
                            ? 'text-slate-200 hover:bg-white/10'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 shrink-0 ml-1 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. CHARTS SIDE-BY-SIDE SECTION */}
      <div className="grid grid-cols-2 gap-3">
        {/* CHART 1 (LEFT): Donut Chart with central percentage & Categories */}
        <div
          className={`rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 border ${
            isDark
              ? 'glass-panel-dark text-white'
              : 'glass-panel-light text-slate-800'
          }`}
        >
          {/* Donut graphic */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke={isDark ? '#1E293B' : '#E2E8F0'}
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke={isDark ? '#60A5FA' : '#2563EB'}
                strokeWidth="10"
                strokeDasharray="85.95 152.81"
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke={isDark ? '#38BDF8' : '#0284C7'}
                strokeWidth="10"
                strokeDasharray="57.3 181.46"
                strokeDashoffset="-88"
                strokeLinecap="round"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#EA580C"
                strokeWidth="10"
                strokeDasharray="64.46 174.3"
                strokeDashoffset="-148"
                strokeLinecap="round"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke={isDark ? '#94A3B8' : '#64748B'}
                strokeWidth="10"
                strokeDasharray="33.42 205.34"
                strokeDashoffset="-215"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={`text-xl sm:text-2xl font-black tracking-tighter ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                {monthlyData.highestCatPercentage}%
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="mt-3 space-y-1.5 text-[11px] sm:text-xs">
            {monthlyData.categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`font-bold tabular-nums ml-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2 (RIGHT): Pie Chart titled with the selected Month */}
        <div
          className={`rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 border ${
            isDark
              ? 'glass-panel-dark text-white'
              : 'glass-panel-light text-slate-800'
          }`}
        >
          {/* Header title */}
          <div className="text-center">
            <button
              onClick={() => {
                setPeriodType('mes');
                setIsMonthDropdownOpen(true);
              }}
              className={`inline-flex items-center gap-1 text-base sm:text-lg font-black tracking-wide font-sans transition-colors group ${
                isDark ? 'text-white hover:text-blue-300' : 'text-slate-800 hover:text-blue-600'
              }`}
              title="Cambiar mes"
            >
              <span>{periodType === 'año' ? `Año ${selectedYear}` : monthNamesFull[selectedMonthIndex]}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 group-hover:translate-y-0.5 transition-all ${
                  isDark ? 'text-slate-400 group-hover:text-blue-300' : 'text-slate-400 group-hover:text-blue-600'
                }`}
              />
            </button>
          </div>

          {/* Pie Chart SVG */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-45" viewBox="0 0 100 100">
              <path
                d="M50,50 L50,6 A44,44 0 0,1 93,57 Z"
                fill="#10B981"
                stroke={isDark ? '#0B152B' : '#FFFFFF'}
                strokeWidth="2"
              />
              <path
                d="M50,50 L93,57 A44,44 0 0,1 23,88 Z"
                fill="#EF4444"
                stroke={isDark ? '#0B152B' : '#FFFFFF'}
                strokeWidth="2"
              />
              <path
                d="M50,50 L23,88 A44,44 0 0,1 50,6 Z"
                fill={isDark ? '#60A5FA' : '#3B82F6'}
                stroke={isDark ? '#0B152B' : '#FFFFFF'}
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Breakdown under pie */}
          <div className="mt-3 space-y-1.5 text-[11px] sm:text-xs">
            {monthlyData.pieBreakdown.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <span
                  className={`font-bold tabular-nums ml-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM TREND / CURVE SECTION */}
      <div
        className={`rounded-3xl p-4 sm:p-5 space-y-3 transition-all duration-300 border ${
          isDark
            ? 'glass-panel-dark text-white'
            : 'glass-panel-light text-slate-800'
        }`}
      >
        {/* Header row: [Ingresos v] ........... [Selected Month] $[Amount] */}
        <div className="flex items-center justify-between relative z-10">
          {/* Trend Metric Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setIsTrendDropdownOpen(!isTrendDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-2xs transition-all active:scale-95 ${
                isDark
                  ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                  : 'bg-white/80 hover:bg-white border border-slate-200 text-slate-800'
              }`}
            >
              <span className="capitalize">{trendMetricType}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isTrendDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isTrendDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsTrendDropdownOpen(false)}
                />
                <div
                  className={`absolute top-full left-0 mt-1 w-32 rounded-2xl p-1 shadow-lg z-30 ${
                    isDark
                      ? 'bg-[#0E1A33] border border-white/20 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setTrendMetricType('ingresos');
                      setIsTrendDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-xl ${
                      isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Ingresos
                  </button>
                  <button
                    onClick={() => {
                      setTrendMetricType('gastos');
                      setIsTrendDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-xl ${
                      isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Gastos
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Header text matching sketch */}
          <div className="text-right">
            <span
              className={`text-xs font-black font-sans tracking-tight ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              {hoveredPoint
                ? `${hoveredPoint.month} `
                : `${monthNamesFull[selectedMonthIndex]} `}
              <span className={`tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {formatCurrency(
                  hoveredPoint ? hoveredPoint.value : trendData.currentValue,
                  currencySymbol
                )}
              </span>
            </span>
          </div>
        </div>

        {/* CURVED TREND GRAPHIC */}
        <div className="relative pt-3 pb-1">
          {/* Tooltip on hover/touch */}
          {hoveredPoint && (
            <div className="absolute top-0 right-1/2 transform translate-x-1/2 bg-slate-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md animate-in fade-in">
              {hoveredPoint.month}: {formatCurrency(hoveredPoint.value, currencySymbol)}
            </div>
          )}

          {/* SVG Chart area */}
          <div className="w-full h-24 sm:h-28">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 320 80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isDark ? '#60A5FA' : '#2563EB'}
                    stopOpacity={isDark ? 0.35 : 0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor={isDark ? '#60A5FA' : '#2563EB'}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              {/* Grid guide line */}
              <line
                x1="0"
                y1="60"
                x2="320"
                y2="60"
                stroke={isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Smooth Bezier Spline Path */}
              <path
                d="M 10 52 C 40 50, 45 42, 70 45 C 95 48, 105 58, 130 54 C 155 50, 165 42, 190 38 C 215 34, 225 46, 250 40 C 275 34, 285 20, 310 14"
                fill="none"
                stroke={isDark ? '#93C5FD' : '#1E293B'}
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Fill under curve */}
              <path
                d="M 10 52 C 40 50, 45 42, 70 45 C 95 48, 105 58, 130 54 C 155 50, 165 42, 190 38 C 215 34, 225 46, 250 40 C 275 34, 285 20, 310 14 L 310 75 L 10 75 Z"
                fill="url(#trendGradient)"
              />

              {/* Circular points on curve */}
              {[
                { x: 10, y: 52, idx: 0 },
                { x: 70, y: 45, idx: 1 },
                { x: 130, y: 54, idx: 2 },
                { x: 190, y: 38, idx: 3 },
                { x: 250, y: 40, idx: 4 },
                { x: 310, y: 14, idx: 5 },
              ].map((pt) => {
                const pointData = trendData.points[pt.idx];
                if (!pointData) return null;
                const isSelected = selectedMonthIndex === pointData.monthIndex;
                return (
                  <g
                    key={pt.idx}
                    className="cursor-pointer group"
                    onClick={() => setSelectedMonthIndex(pointData.monthIndex)}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        month: pointData.fullName,
                        value: pointData.value,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        className={isDark ? 'fill-blue-400/30 animate-ping' : 'fill-blue-500/20 animate-ping'}
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? '5' : '3.5'}
                      className={`transition-all ${
                        isSelected
                          ? isDark
                            ? 'fill-white stroke-blue-500 stroke-[2]'
                            : 'fill-blue-600 stroke-white stroke-[2]'
                          : isDark
                          ? 'fill-slate-300 group-hover:fill-white'
                          : 'fill-slate-800 group-hover:fill-blue-500'
                      }`}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Month Labels on X-axis */}
          <div className="flex items-center justify-between px-1 mt-1 text-[11px] sm:text-xs font-bold">
            {trendData.points.map((pt) => (
              <button
                key={pt.monthIndex}
                onClick={() => setSelectedMonthIndex(pt.monthIndex)}
                className={`py-0.5 px-1 rounded transition-colors ${
                  selectedMonthIndex === pt.monthIndex
                    ? isDark
                      ? 'text-white font-black scale-105'
                      : 'text-blue-600 font-black scale-105'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK INLINE BUTTON TO ADD INCOME */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowAddIncomeModal(true)}
          className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs ${
            isDark
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Nuevo Ingreso</span>
        </button>
      </div>

      {/* MODAL: AÑADIR INGRESO */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div
            className={`relative w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 ${
              isDark
                ? 'bg-[#0E1A33] border border-white/20 text-white'
                : 'bg-white text-slate-900'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                isDark ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Registrar Ingreso</span>
              </h3>
              <button
                onClick={() => setShowAddIncomeModal(false)}
                className={`p-1 rounded-lg ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncome} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Monto ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newIncomeAmount}
                  onChange={(e) => setNewIncomeAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Descripción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nómina, Freelance, Bono"
                  value={newIncomeTitle}
                  onChange={(e) => setNewIncomeTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Categoría
                  </label>
                  <select
                    value={newIncomeCategory}
                    onChange={(e) => setNewIncomeCategory(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-[#152342] border border-white/20 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Sueldo">Sueldo / Nómina</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Negocio">Negocio</option>
                    <option value="Inversiones">Inversiones</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newIncomeDate}
                    onChange={(e) => setNewIncomeDate(e.target.value)}
                    className={`w-full px-2 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-[#152342] border border-white/20 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncomeModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Guardar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
