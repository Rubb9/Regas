/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Plus, Sparkles, Smartphone, Monitor, ChevronLeft, Sun, Moon } from 'lucide-react';
import { CalendarCard } from './components/CalendarCard.tsx';
import { MetricsCards } from './components/MetricsCards.tsx';
import { RecentExpenses } from './components/RecentExpenses.tsx';
import { BottomNavBar } from './components/BottomNavBar.tsx';
import { AddExpenseModal } from './components/AddExpenseModal.tsx';
import { ReceiptScannerModal } from './components/ReceiptScannerModal.tsx';
import { VirtualReceiptCard } from './components/VirtualReceiptCard.tsx';
import { ExpensesListTab } from './components/ExpensesListTab.tsx';
import { CategoriesTab } from './components/CategoriesTab.tsx';
import { SavingsSection } from './components/SavingsSection.tsx';
import { StatisticsTab } from './components/StatisticsTab.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { INITIAL_EXPENSES, INITIAL_SAVINGS_GOALS, INITIAL_INCOMES } from './data/initialData.ts';
import { Expense, SavingsGoal, ActiveTab, VirtualReceipt, Income } from './types.ts';
import { formatCurrency } from './utils/formatters.ts';
import {
  safeSaveExpenses,
  safeLoadExpenses,
  safeSaveIncomes,
  safeLoadIncomes,
  STORAGE_SAVINGS_KEY,
  STORAGE_CURRENCY_KEY,
} from './utils/storage.ts';
import { storeReceiptPhoto, deleteReceiptPhoto } from './utils/imageDb.ts';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';

function MainApp() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');

  // Calendar State: Default September 2026 as in the sketch
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)
  const [selectedDate, setSelectedDate] = useState('2026-09-22'); // 22 is circled in sketch

  // Data State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const loaded = safeLoadExpenses(INITIAL_EXPENSES);
    return loaded.map((item: Expense) => {
      if (item.id === 'exp-1' && !item.virtualReceipt) {
        const defaultExp1 = INITIAL_EXPENSES.find((e) => e.id === 'exp-1');
        return { ...item, virtualReceipt: defaultExp1?.virtualReceipt };
      }
      return item;
    });
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAVINGS_GOALS;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    return safeLoadIncomes(INITIAL_INCOMES);
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_CURRENCY_KEY) || '$';
    } catch {
      return '$';
    }
  });

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeVirtualReceipt, setActiveVirtualReceipt] = useState<VirtualReceipt | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [prefilledExpense, setPrefilledExpense] = useState<Partial<Expense> | null>(null);

  // Desktop view preference: phone mockup vs wide mode
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [moreSubTab, setMoreSubTab] = useState<'ahorro' | 'categorias'>('ahorro');

  // Save changes to localStorage safely without exceeding quota
  useEffect(() => {
    safeSaveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    safeSaveIncomes(incomes);
  }, [incomes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVINGS_KEY, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error(e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, currencySymbol);
    } catch (e) {
      console.error(e);
    }
  }, [currencySymbol]);

  // Derived: Expenses in current selected month
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === currentYear && m - 1 === currentMonth;
    });
  }, [expenses, currentYear, currentMonth]);

  // Derived: Set of day numbers that have at least one expense
  const daysWithExpenses = useMemo(() => {
    const daysSet = new Set<number>();
    currentMonthExpenses.forEach((e) => {
      const parts = e.date.split('-');
      if (parts.length === 3) {
        daysSet.add(parseInt(parts[2], 10));
      }
    });
    return daysSet;
  }, [currentMonthExpenses]);

  // Derived: Metrics for current month
  const daysWithPurchases = daysWithExpenses.size;
  const totalMonth = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  const highestPurchase = useMemo(() => {
    if (currentMonthExpenses.length === 0) return 0;
    return Math.max(...currentMonthExpenses.map((e) => e.amount));
  }, [currentMonthExpenses]);

  // Expenses for the selected date
  const dateFilteredExpenses = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate]);

  // Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? {
                ...item,
                ...expenseData,
              }
            : item
        )
      );
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
    setEditingExpense(null);
    setPrefilledExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    deleteReceiptPhoto(`photo_${id}`).catch(console.warn);
    if (editingExpense?.id === id) {
      setEditingExpense(null);
    }
  };

  const handleAddIncome = (incomeData: Omit<Income, 'id' | 'createdAt'>) => {
    const newIncome: Income = {
      ...incomeData,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const handleReceiptScanned = async (virtualReceipt: VirtualReceipt, rawPhotoDataUrl?: string) => {
    let photoRef = undefined;
    if (rawPhotoDataUrl) {
      const photoKey = `photo_${virtualReceipt.id}`;
      await storeReceiptPhoto(photoKey, rawPhotoDataUrl);
      photoRef = `idb:${photoKey}`;
    }

    const receiptWithIdbPhoto = {
      ...virtualReceipt,
      realPhotoUrl: photoRef || virtualReceipt.realPhotoUrl,
    };

    setActiveVirtualReceipt(receiptWithIdbPhoto);
  };

  const handleSaveVirtualReceipt = (receipt: VirtualReceipt) => {
    const newExpense: Expense = {
      id: receipt.id || `exp-${Date.now()}`,
      title: receipt.merchantName || 'Compra con Factura',
      amount: receipt.totalAmount || 0,
      category: receipt.category || 'supermercado',
      date: receipt.date || new Date().toISOString().split('T')[0],
      paymentMethod: 'debito',
      notes: `Factura (${receipt.items.length} productos)`,
      receiptUrl: receipt.realPhotoUrl,
      virtualReceipt: receipt,
      createdAt: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setActiveVirtualReceipt(null);
  };

  const handleUpdateVirtualReceipt = (updatedReceipt: VirtualReceipt) => {
    setActiveVirtualReceipt(updatedReceipt);

    setExpenses((prev) =>
      prev.map((e) => {
        if (e.virtualReceipt?.id === updatedReceipt.id || e.id === updatedReceipt.id) {
          return {
            ...e,
            title: updatedReceipt.merchantName,
            amount: updatedReceipt.totalAmount,
            category: updatedReceipt.category || e.category,
            date: updatedReceipt.date,
            virtualReceipt: updatedReceipt,
          };
        }
        return e;
      })
    );
  };

  const handleAddSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateSavingsAmount = (goalId: string, deltaAmount: number) => {
    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            currentAmount: Math.max(0, goal.currentAmount + deltaAmount),
          };
        }
        return goal;
      })
    );
  };

  const handleResetSampleData = () => {
    setExpenses(INITIAL_EXPENSES);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setIncomes(INITIAL_INCOMES);
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDate('2026-09-22');
    setIsSettingsOpen(false);
  };

  const handleExportData = () => {
    const data = {
      expenses,
      savingsGoals,
      incomes,
      currencySymbol,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mis_gastos_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json.expenses)) setExpenses(json.expenses);
        if (Array.isArray(json.savingsGoals)) setSavingsGoals(json.savingsGoals);
        if (Array.isArray(json.incomes)) setIncomes(json.incomes);
        if (json.currencySymbol) setCurrencySymbol(json.currencySymbol);
        setIsSettingsOpen(false);
      } catch (err) {
        alert('Archivo de copia de seguridad no válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#DDE2E8] sm:py-6 flex flex-col items-center justify-start transition-colors duration-300">
      {/* Desktop view switcher (top floating toolbar for wider screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-2 mb-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-bold">
          <span>Vista previa:</span>
          <span className="text-blue-700 font-extrabold">Mis gastos & Ahorro</span>
        </div>
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md p-1 rounded-2xl shadow-xs border border-white/60">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`px-3 py-1 rounded-xl flex items-center gap-1 text-[11px] font-bold transition-all ${
              isPhoneFrame ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`px-3 py-1 rounded-xl flex items-center gap-1 text-[11px] font-bold transition-all ${
              !isPhoneFrame ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Expandido</span>
          </button>
        </div>
      </div>

      {/* Main Container: phone viewport frame with exact light / dark atmospheric gradients */}
      <div
        className={`w-full min-h-screen sm:min-h-[852px] transition-all duration-300 flex flex-col relative ${
          isDark
            ? 'bg-gradient-to-b from-[#060C1B] via-[#142340] to-[#637D9E] text-white'
            : 'bg-gradient-to-b from-[#7694A8] via-[#CFDDE6] to-[#F1F5F9] text-slate-900'
        } ${
          isPhoneFrame
            ? 'sm:max-w-[430px] sm:rounded-[3.2rem] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] sm:border-[8px] sm:border-slate-950 sm:overflow-hidden'
            : 'sm:max-w-2xl sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-300'
        }`}
      >
        {/* Top Status bar decoration in phone mockup frame (19:30 matching the user's reference mockup) */}
        {isPhoneFrame && (
          <div
            className={`hidden sm:flex items-center justify-between px-8 pt-3 pb-1 text-[11px] font-bold select-none ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            <span>19:30</span>
            <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto ring-1 ring-white/10" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className={`w-4 h-2.5 border rounded-xs p-0.5 flex items-center ${isDark ? 'border-white/80' : 'border-slate-800'}`}>
                <div className={`w-full h-full rounded-2xs ${isDark ? 'bg-white' : 'bg-slate-800'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Screen Content */}
        <main className="flex-1 px-5 pt-4 pb-16 overflow-y-auto no-scrollbar">
          {/* Header matching the reference image typography & layout */}
          <header className="flex items-start justify-between pt-2 pb-4">
            <div>
              <h1
                className={`text-[2rem] sm:text-[2.2rem] font-black tracking-tight leading-none ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                {activeTab === 'inicio' && 'Mis gastos'}
                {activeTab === 'gastos' && 'Registro de Gastos'}
                {activeTab === 'estadisticas' && 'Estadísticas'}
                {activeTab === 'categorias' && 'Categorías'}
                {activeTab === 'mas' && 'Metas & Ahorro'}
              </h1>
              <p
                className={`text-[0.95rem] font-semibold mt-1 tracking-tight ${
                  isDark ? 'text-[#8DA9D4]' : 'text-[#3E586C]'
                }`}
              >
                {activeTab === 'inicio' && 'Lleva un mejor control de tu dinero'}
                {activeTab === 'gastos' && 'Historial detallado y búsqueda'}
                {activeTab === 'estadisticas' && 'Resumen financiero y métricas'}
                {activeTab === 'categorias' && 'Controla cuánto gastas por rubro'}
                {activeTab === 'mas' && 'Construye tu fondo y alcanza tus metas'}
              </p>
            </div>

            {/* Top Right Actions: Theme Toggle Pill & Settings Button */}
            <div className="flex items-center gap-1.5 -mr-1">
              <button
                onClick={toggleTheme}
                aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs ${
                  isDark
                    ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                    : 'bg-white/60 hover:bg-white/80 border border-white/70 text-slate-800'
                }`}
                title={`Cambiar a ${isDark ? 'Modo Claro' : 'Modo Oscuro'}`}
              >
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-300 stroke-[2.5]" />
                    <span className="font-black text-[11px]">Oscuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                    <span className="font-black text-[11px]">Claro</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Ajustes y configuración"
                className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                  isDark
                    ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                    : 'bg-white/60 hover:bg-white/80 border border-white/70 text-slate-800'
                }`}
              >
                <Settings className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </header>

          {/* TAB 1: INICIO (Exact sketch screen) */}
          {activeTab === 'inicio' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Calendar Card */}
              <CalendarCard
                currentYear={currentYear}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                daysWithExpenses={daysWithExpenses}
                onSelectDate={(dateStr) => setSelectedDate(dateStr)}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />

              {/* 3 Metrics Cards */}
              <MetricsCards
                daysWithPurchases={daysWithPurchases}
                totalMonth={totalMonth}
                highestPurchase={highestPurchase}
                currencySymbol={currencySymbol}
                onCardClick={(type) => {
                  if (type === 'total' || type === 'highest') {
                    setActiveTab('gastos');
                  }
                }}
              />

              {/* Savings Highlight Banner (Frosted glass container matching screenshot) */}
              <div
                onClick={() => setActiveTab('mas')}
                className={`rounded-3xl p-4 flex items-center justify-between cursor-pointer transition-all group active:scale-[0.99] border ${
                  isDark
                    ? 'glass-panel-dark glass-panel-dark-hover text-white'
                    : 'glass-panel-light glass-panel-light-hover text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-colors ${
                      isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-tight">
                      Metas de Ahorro Activas
                    </h4>
                    <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                      Total acumulado:{' '}
                      <span className={`font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(
                          savingsGoals.reduce((a, b) => a + b.currentAmount, 0),
                          currencySymbol
                        )}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-black flex items-center ${
                    isDark ? 'text-blue-300' : 'text-blue-600'
                  }`}
                >
                  Ver metas →
                </span>
              </div>

              {/* Recent Expenses List */}
              <RecentExpenses
                expenses={
                  dateFilteredExpenses.length > 0
                    ? dateFilteredExpenses
                    : currentMonthExpenses.slice(0, 5)
                }
                currencySymbol={currencySymbol}
                selectedDate={
                  dateFilteredExpenses.length > 0 && selectedDate !== ''
                    ? selectedDate
                    : undefined
                }
                onViewAll={() => setActiveTab('gastos')}
                onSelectExpense={(expense) => {
                  setEditingExpense(expense);
                  setIsAddExpenseOpen(true);
                }}
                onAddNewExpense={() => {
                  setEditingExpense(null);
                  setPrefilledExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                onClearDateFilter={() => setSelectedDate('')}
                onViewVirtualReceipt={(receipt) => setActiveVirtualReceipt(receipt)}
              />
            </div>
          )}

          {/* TAB 2: GASTOS (Full list with search, sorting, CSV export) */}
          {activeTab === 'gastos' && (
            <ExpensesListTab
              expenses={expenses}
              currencySymbol={currencySymbol}
              onSelectExpense={(exp) => {
                setEditingExpense(exp);
                setIsAddExpenseOpen(true);
              }}
              onAddNewExpense={() => {
                setEditingExpense(null);
                setPrefilledExpense(null);
                setIsAddExpenseOpen(true);
              }}
              onViewVirtualReceipt={(receipt) => setActiveVirtualReceipt(receipt)}
            />
          )}

          {/* TAB 3: ESTADÍSTICAS (Pencil sketch recreation with month picker & colors) */}
          {activeTab === 'estadisticas' && (
            <StatisticsTab
              expenses={expenses}
              incomes={incomes}
              currencySymbol={currencySymbol}
              onAddIncome={handleAddIncome}
            />
          )}

          {/* TAB 4: MÁS (Ahorro & Categorías) */}
          {activeTab === 'mas' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Sub-tab pills */}
              <div
                className={`p-1 rounded-full flex items-center shadow-2xs border ${
                  isDark
                    ? 'glass-panel-dark'
                    : 'glass-panel-light'
                }`}
              >
                <button
                  onClick={() => setMoreSubTab('ahorro')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                    moreSubTab === 'ahorro'
                      ? isDark
                        ? 'bg-white text-slate-950 font-black shadow-md'
                        : 'bg-white text-slate-900 font-black shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Metas de Ahorro
                </button>
                <button
                  onClick={() => setMoreSubTab('categorias')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                    moreSubTab === 'categorias'
                      ? isDark
                        ? 'bg-white text-slate-950 font-black shadow-md'
                        : 'bg-white text-slate-900 font-black shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Categorías y Presupuesto
                </button>
              </div>

              {moreSubTab === 'ahorro' ? (
                <SavingsSection
                  savingsGoals={savingsGoals}
                  currencySymbol={currencySymbol}
                  onAddGoal={handleAddSavingsGoal}
                  onUpdateGoalAmount={handleUpdateSavingsAmount}
                />
              ) : (
                <CategoriesTab
                  expenses={expenses}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  currencySymbol={currencySymbol}
                />
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      </div>

      {/* MODALS */}
      {/* 1. Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
          setPrefilledExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense}
        onOpenVirtualReceipt={(receipt) => {
          setIsAddExpenseOpen(false);
          setActiveVirtualReceipt(receipt);
        }}
        initialExpense={
          editingExpense ||
          (prefilledExpense
            ? ({
                id: '',
                title: prefilledExpense.title || '',
                amount: prefilledExpense.amount || 0,
                category: prefilledExpense.category || 'supermercado',
                date: prefilledExpense.date || selectedDate || new Date().toISOString().split('T')[0],
                paymentMethod: prefilledExpense.paymentMethod || 'debito',
                notes: prefilledExpense.notes || '',
                receiptUrl: prefilledExpense.receiptUrl,
                createdAt: Date.now(),
              } as Expense)
            : null)
        }
        defaultDate={selectedDate || new Date().toISOString().split('T')[0]}
        currencySymbol={currencySymbol}
      />

      {/* 2. Receipt Scanner / Camera Modal */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReceiptScanned={handleReceiptScanned}
        onManualEntry={() => {
          setEditingExpense(null);
          setPrefilledExpense(null);
          setIsAddExpenseOpen(true);
        }}
      />

      {/* 3. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currencySymbol={currencySymbol}
        onChangeCurrency={(sym) => setCurrencySymbol(sym)}
        onResetSampleData={handleResetSampleData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearAll={() => {
          setExpenses([]);
          setIsSettingsOpen(false);
        }}
      />

      {/* 4. Factura Virtual Modal */}
      {activeVirtualReceipt && (
        <VirtualReceiptCard
          receipt={activeVirtualReceipt}
          onClose={() => setActiveVirtualReceipt(null)}
          onSaveToExpenses={handleSaveVirtualReceipt}
          onUpdateReceipt={handleUpdateVirtualReceipt}
          showSaveButton={!expenses.some((e) => e.virtualReceipt?.id === activeVirtualReceipt.id)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
