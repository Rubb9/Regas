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
  TrendingUp,
  ArrowUpRight,
  Target,
  X,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';

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
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider block">
                Total Ahorrado
              </span>
              <h2 className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                {formatCurrency(totalSaved, currencySymbol)}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingGoal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Meta</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-blue-100">Progreso global de metas</span>
            <span className="text-white tabular-nums">{overallProgress}% alcanzado</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-blue-200 mt-1.5">
            <span>Objetivo total: {formatCurrency(totalTarget, currencySymbol)}</span>
            <span>Faltan: {formatCurrency(Math.max(0, totalTarget - totalSaved), currencySymbol)}</span>
          </div>
        </div>
      </div>

      {/* Savings Goals List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Metas de Ahorro Activas
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {savingsGoals.length} meta{savingsGoals.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {savingsGoals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: goal.color }}
                    >
                      {renderGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">
                        Meta: {formatCurrency(goal.targetAmount, currencySymbol)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGoalForDeposit(goal)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all active:scale-95"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Aportar</span>
                  </button>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800 font-bold tabular-nums">
                      {formatCurrency(goal.currentAmount, currencySymbol)}
                    </span>
                    <span className={`tabular-nums ${isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                      {percent}% {isCompleted && '🎉 ¡Meta cumplida!'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
      <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/60 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-950">
            Regla de Oro del Ahorro: 50/30/20
          </h4>
          <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
            Destina el 50% de tus ingresos a necesidades básicas, 30% a gastos personales y al menos un 20% directo a tu alcancía de ahorro antes de gastar.
          </p>
        </div>
      </div>

      {/* Deposit Modal */}
      {selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Aportar a: {selectedGoalForDeposit.title}
              </h3>
              <button
                onClick={() => setSelectedGoalForDeposit(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="py-4 space-y-4">
              <div className="bg-blue-50/70 p-4 rounded-2xl text-center border border-blue-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  ¿Cuánto deseas ahorrar hoy?
                </span>
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-blue-600 mr-1.5">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="25.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    autoFocus
                    className="text-4xl font-extrabold text-slate-900 bg-transparent text-center focus:outline-none w-44 tabular-nums"
                  />
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val.toString())}
                    className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95"
                  >
                    +{currencySymbol}{val}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Confirmar Aporte</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isCreatingGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Nueva Meta de Ahorro
              </h3>
              <button
                onClick={() => setIsCreatingGoal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la meta
                </label>
                <input
                  type="text"
                  placeholder="Ej. Curso Online, Moto, Boda..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta Objetivo ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="500"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ahorro Inicial ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Color distintivo
                </label>
                <div className="flex items-center gap-2">
                  {['#2563EB', '#16A34A', '#9333EA', '#EA580C', '#DC2626', '#0284C7'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newColor === col ? 'scale-110 ring-2 ring-offset-2 ring-slate-900' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all mt-2"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Crear Meta</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
