import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  ShieldCheck,
  Palmtree,
  Laptop,
  Car,
  Home,
  Sparkles,
  ArrowUpRight,
  Target,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface SavingsSectionProps {
  savingsGoals: SavingsGoal[];
  currencySymbol?: string;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoalAmount: (goalId: string, deltaAmount: number) => void;
}

export const SavingsSection: React.FC<SavingsSectionProps> = ({
  savingsGoals,
  currencySymbol = '$',
  onAddGoal,
  onUpdateGoalAmount,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newColor, setNewColor] = useState('#2563EB');
  const [newIcon, setNewIcon] = useState('PiggyBank');

  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!selectedGoalForDeposit || isNaN(amount) || amount <= 0) return;

    onUpdateGoalAmount(selectedGoalForDeposit.id, amount);

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#F59E0B', '#6366F1'],
    });

    setDepositAmount('');
    setSelectedGoalForDeposit(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    const initial = parseFloat(newCurrent) || 0;
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    onAddGoal({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      color: newColor,
      icon: newIcon,
    });

    setIsCreatingGoal(false);
    setNewTitle('');
    setNewTarget('');
    setNewCurrent('');
  };

  const renderGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-white" />;
      case 'Palmtree':
        return <Palmtree className="w-5 h-5 text-white" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-white" />;
      case 'Car':
        return <Car className="w-5 h-5 text-white" />;
      case 'Home':
        return <Home className="w-5 h-5 text-white" />;
      default:
        return <PiggyBank className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Header Banner - Total Savings */}
      <div
        className={`rounded-[2rem] p-6 text-white relative overflow-hidden transition-all backdrop-blur-xl ${
          isDark
            ? 'bg-gradient-to-br from-[#0F1E3A]/90 via-[#1A2E56]/80 to-[#254077]/70 border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.5)]'
            : 'bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-blue-950/90 border border-slate-700/80 shadow-[0_12px_36px_rgba(15,23,42,0.15)]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Total Ahorrado
              </span>
              <h2 className="text-3xl font-black text-white tabular-nums tracking-tight">
                {formatCurrency(totalSaved, currencySymbol)}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingGoal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-950 font-black text-xs shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Meta</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-200">Progreso global de metas</span>
            <span className="text-white tabular-nums">{overallProgress}% alcanzado</span>
          </div>
          <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3
            className={`text-lg font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Tus Metas Activas ({savingsGoals.length})
          </h3>
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Meta total: {formatCurrency(totalTarget, currencySymbol)}
          </span>
        </div>

        <div className="space-y-3">
          {savingsGoals.map((goal) => {
            const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className={`rounded-2xl p-4 border transition-all duration-200 ${
                  isDark
                    ? 'glass-panel-dark glass-panel-dark-hover text-white'
                    : 'glass-panel-light glass-panel-light-hover text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: goal.color }}
                    >
                      {renderGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black">{goal.title}</h4>
                      <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                        Meta: {formatCurrency(goal.targetAmount, currencySymbol)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGoalForDeposit(goal)}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full font-black text-xs transition-all active:scale-95 ${
                      isDark
                        ? 'bg-white/15 text-white hover:bg-white hover:text-slate-950'
                        : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Aportar</span>
                  </button>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="tabular-nums">
                      {formatCurrency(goal.currentAmount, currencySymbol)}
                    </span>
                    <span
                      className={`tabular-nums ${
                        isCompleted ? 'text-emerald-400 font-black' : isDark ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {percent}% {isCompleted && '🎉 ¡Meta cumplida!'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Savings Tip Card */}
      <div
        className={`rounded-2xl p-4 border flex items-start gap-3 ${
          isDark
            ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-200'
            : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black">Regla de Oro del Ahorro: 50/30/20</h4>
          <p className="text-xs mt-0.5 leading-relaxed opacity-90">
            Destina el 50% de tus ingresos a necesidades básicas, 30% a gastos personales y al menos un 20% directo a tu alcancía de ahorro antes de gastar.
          </p>
        </div>
      </div>

      {/* Deposit Modal */}
      {selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl ${
              isDark ? 'bg-[#0E1A33] border border-white/20 text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <h3 className="text-lg font-black">Aportar a: {selectedGoalForDeposit.title}</h3>
              <button
                onClick={() => setSelectedGoalForDeposit(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Monto a agregar</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-black opacity-60">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className={`w-full pl-9 pr-4 py-3 rounded-2xl text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForDeposit(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isCreatingGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl ${
              isDark ? 'bg-[#0E1A33] border border-white/20 text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <h3 className="text-lg font-black">Crear Nueva Meta</h3>
              <button
                onClick={() => setIsCreatingGoal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Nombre de la meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vacaciones en la playa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Monto Objetivo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1000.00"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Monto Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingGoal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
