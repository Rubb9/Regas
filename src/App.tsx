/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Plus, Sparkles, Smartphone, Monitor, ChevronLeft } from 'lucide-react';
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
import { SettingsModal } from './components/SettingsModal.tsx';
import { INITIAL_EXPENSES, INITIAL_SAVINGS_GOALS } from './data/initialData.ts';
import { Expense, SavingsGoal, ActiveTab, VirtualReceipt } from './types.ts';
import { formatCurrency } from './utils/formatters.ts';
import {
  safeSaveExpenses,
  safeLoadExpenses,
  STORAGE_SAVINGS_KEY,
  STORAGE_CURRENCY_KEY,
} from './utils/storage.ts';
import { storeReceiptPhoto, deleteReceiptPhoto } from './utils/imageDb.ts';

export default function App() {
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

  // Save changes to localStorage safely without exceeding quota
  useEffect(() => {
    safeSaveExpenses(expenses);
  }, [expenses]);

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

  // Calculations for current month view
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === currentYear && m - 1 === currentMonth;
    });
  }, [expenses, currentYear, currentMonth]);

  // Days with expenses in the current month (for calendar highlights)
  const daysWithExpenses = useMemo(() => {
    const days = new Set<number>();
    currentMonthExpenses.forEach((e) => {
      const d = parseInt(e.date.split('-')[2], 10);
      if (!isNaN(d)) days.add(d);
    });
    return days;
  }, [currentMonthExpenses]);

  // Metrics for current month
  const totalMonth = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  const highestPurchase = useMemo(() => {
    if (currentMonthExpenses.length === 0) return 0;
    return Math.max(...currentMonthExpenses.map((e) => e.amount));
  }, [currentMonthExpenses]);

  const daysWithPurchases = daysWithExpenses.size;

  // Filtered expenses for selected date in Inicio tab
  const dateFilteredExpenses = useMemo(() => {
    if (!selectedDate) return currentMonthExpenses;
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate, currentMonthExpenses]);

  // Handlers for month navigation
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

  // Expense Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? { ...item, ...expenseData }
            : item
        )
      );
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        ...expenseData,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newExpense, ...prev]);

      // Automatically adjust current month/year to this expense's date
      const [expY, expM] = expenseData.date.split('-').map(Number);
      if (!isNaN(expY) && !isNaN(expM)) {
        setCurrentYear(expY);
        setCurrentMonth(expM - 1);
        setSelectedDate(expenseData.date);
      }
    }
    setEditingExpense(null);
    setPrefilledExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    deleteReceiptPhoto(`photo_${id}`).catch(console.warn);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setEditingExpense(null);
  };

  // Receipt Scanner Handler
  const handleReceiptScanned = (receipt: VirtualReceipt) => {
    setActiveVirtualReceipt(receipt);
  };

  const handleSaveVirtualReceipt = (receipt: VirtualReceipt) => {
    // Format date properly: DD/MM/YYYY or YYYY-MM-DD
    let formattedDate = receipt.date;
    if (receipt.date.includes('/')) {
      const parts = receipt.date.split('/');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const expenseId = `exp-${Date.now()}`;
    let photoRef = receipt.realPhotoUrl;
    if (receipt.realPhotoUrl && receipt.realPhotoUrl.startsWith('data:image')) {
      const photoKey = `photo_${expenseId}`;
      storeReceiptPhoto(photoKey, receipt.realPhotoUrl).catch(console.warn);
      photoRef = `idb:${photoKey}`;
    }

    const newExpense: Expense = {
      id: expenseId,
      title: receipt.merchantName,
      amount: receipt.totalAmount,
      date: formattedDate,
      category: receipt.category || 'supermercado',
      paymentMethod: 'debito',
      notes: `Factura virtual con ${receipt.items.length} productos`,
      virtualReceipt: {
        ...receipt,
        id: receipt.id || expenseId,
        realPhotoUrl: photoRef,
      },
      receiptUrl: photoRef,
      createdAt: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    const [expY, expM] = formattedDate.split('-').map(Number);
    if (!isNaN(expY) && !isNaN(expM)) {
      setCurrentYear(expY);
      setCurrentMonth(expM - 1);
      setSelectedDate(formattedDate);
    }

    setActiveVirtualReceipt(null);
  };

  const handleUpdateVirtualReceipt = (updatedReceipt: VirtualReceipt) => {
    setActiveVirtualReceipt(updatedReceipt);

    // If an existing expense contains this receipt, update its title, amount, and receipt
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.virtualReceipt?.id === updatedReceipt.id || exp.id === updatedReceipt.id) {
          let formattedDate = updatedReceipt.date;
          if (updatedReceipt.date.includes('/')) {
            const parts = updatedReceipt.date.split('/');
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }
          return {
            ...exp,
            title: updatedReceipt.merchantName,
            amount: updatedReceipt.totalAmount,
            date: formattedDate,
            notes: `Factura virtual con ${updatedReceipt.items.length} productos`,
            virtualReceipt: updatedReceipt,
          };
        }
        return exp;
      })
    );
  };

  // Savings Handlers
  const handleAddSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      id: `save-${Date.now()}`,
      ...goalData,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoalAmount = (goalId: string, deltaAmount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.max(0, g.currentAmount + deltaAmount) }
          : g
      )
    );
  };

  // Data Reset
  const handleResetSampleData = () => {
    setExpenses(INITIAL_EXPENSES);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDate('2026-09-22');
    setIsSettingsOpen(false);
  };

  const handleExportData = () => {
    const backup = {
      expenses,
      savingsGoals,
      currencySymbol,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mis_gastos_backup_${new Date().toISOString().split('T')[0]}.json`);
    downloadAnchor.click();
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.expenses && Array.isArray(parsed.expenses)) {
          setExpenses(parsed.expenses);
        }
        if (parsed.savingsGoals && Array.isArray(parsed.savingsGoals)) {
          setSavingsGoals(parsed.savingsGoals);
        }
        if (parsed.currencySymbol) {
          setCurrencySymbol(parsed.currencySymbol);
        }
        setIsSettingsOpen(false);
      } catch (err) {
        console.warn('Formato de archivo inválido:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] sm:py-6 flex flex-col items-center justify-start">
      {/* Desktop view switcher (top floating toolbar for wider screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-2 mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <span>Vista previa:</span>
          <span className="text-blue-600 font-bold">Mis gastos & Ahorro</span>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-slate-200">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ${
              isPhoneFrame ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ${
              !isPhoneFrame ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Expandido</span>
          </button>
        </div>
      </div>

      {/* Main Container: phone viewport frame on desktop or full screen on mobile */}
      <div
        className={`w-full bg-[#F8FAFC] min-h-screen sm:min-h-[844px] transition-all flex flex-col relative ${
          isPhoneFrame
            ? 'sm:max-w-[430px] sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-900/90 sm:overflow-hidden'
            : 'sm:max-w-2xl sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-200'
        }`}
      >
        {/* Top Status bar decoration in mobile mockup frame */}
        {isPhoneFrame && (
          <div className="hidden sm:flex items-center justify-between px-8 pt-3 pb-1 text-[11px] font-bold text-slate-800 select-none">
            <span>9:41</span>
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-800 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Screen Content */}
        <main className="flex-1 px-5 pt-4 pb-12 overflow-y-auto no-scrollbar">
          {/* Header (Exact matching sketch) */}
          <header className="flex items-start justify-between pt-2 pb-4">
            <div>
              <h1 className="text-[2rem] sm:text-[2.2rem] font-extrabold text-[#0F172A] tracking-tight leading-none">
                {activeTab === 'inicio' && 'Mis gastos'}
                {activeTab === 'gastos' && 'Registro de Gastos'}
                {activeTab === 'categorias' && 'Categorías & Presupuesto'}
                {activeTab === 'mas' && 'Metas & Ahorro'}
              </h1>
              <p className="text-[0.95rem] text-[#64748B] font-medium mt-1">
                {activeTab === 'inicio' && 'Lleva un mejor control de tu dinero'}
                {activeTab === 'gastos' && 'Historial detallado y búsqueda'}
                {activeTab === 'categorias' && 'Controla cuánto gastas por rubro'}
                {activeTab === 'mas' && 'Construye tu fondo y alcanza tus metas'}
              </p>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Ajustes y configuración"
              className="w-11 h-11 rounded-2xl hover:bg-slate-200/60 active:scale-95 transition-all text-slate-700 flex items-center justify-center -mr-1"
            >
              <Settings className="w-6 h-6 stroke-[2]" />
            </button>
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

              {/* Savings Highlight Banner (Integrated Ahorro feature preview on Inicio) */}
              <div
                onClick={() => setActiveTab('mas')}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Metas de Ahorro Activas
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total acumulado:{' '}
                      <span className="font-bold text-slate-800 tabular-nums">
                        {formatCurrency(
                          savingsGoals.reduce((a, b) => a + b.currentAmount, 0),
                          currencySymbol
                        )}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 flex items-center">
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

          {/* TAB 3: CATEGORIAS */}
          {activeTab === 'categorias' && (
            <CategoriesTab
              expenses={expenses}
              currentMonth={currentMonth}
              currentYear={currentYear}
              currencySymbol={currencySymbol}
            />
          )}

          {/* TAB 4: AHORRO / MÁS */}
          {activeTab === 'mas' && (
            <SavingsSection
              savingsGoals={savingsGoals}
              currencySymbol={currencySymbol}
              onAddGoal={handleAddSavingsGoal}
              onUpdateGoalAmount={handleUpdateGoalAmount}
            />
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
