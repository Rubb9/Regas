import React from 'react';
import { X, RotateCcw, Download, Upload, Shield, Info, DollarSign, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onChangeCurrency: (symbol: string) => void;
  onResetSampleData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onChangeCurrency,
  onResetSampleData,
  onExportData,
  onImportData,
  onClearAll,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currencies = [
    { symbol: '$', code: 'USD', name: 'Dólar Estadounidense ($)' },
    { symbol: '€', code: 'EUR', name: 'Euro (€)' },
    { symbol: 'S/', code: 'PEN', name: 'Sol Peruano (S/)' },
    { symbol: 'Mex$', code: 'MXN', name: 'Peso Mexicano (Mex$)' },
    { symbol: 'Col$', code: 'COP', name: 'Peso Colombiano (Col$)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar transition-all backdrop-blur-2xl border ${
          isDark
            ? 'bg-[#0E1A33]/90 border-white/20 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]'
            : 'bg-white/90 border-white/90 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12),inset_0_1px_2px_rgba(255,255,255,1)]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div>
            <h3 className="text-lg font-black tracking-tight">
              Ajustes y Preferencias
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Personaliza tu experiencia de control y ahorro
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isDark
                ? 'bg-white/10 text-slate-300 hover:text-white'
                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Theme Selector */}
          <div>
            <label className={`block text-xs font-bold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Tema de Colores</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl flex items-center justify-between border text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                    : isDark
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Modo Claro</span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl flex items-center justify-between border text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'border-blue-400 bg-white/20 text-white shadow-md'
                    : isDark
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Modo Oscuro</span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className={`block text-xs font-bold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Moneda Principal</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.symbol}
                  onClick={() => onChangeCurrency(curr.symbol)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                    currencySymbol === curr.symbol
                      ? isDark
                        ? 'border-blue-400 bg-blue-500/20 text-blue-200'
                        : 'border-blue-600 bg-blue-50 text-blue-700'
                      : isDark
                      ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-extrabold mr-1">{curr.symbol}</span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{curr.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <label className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Gestión de Datos y Respaldo</span>
            </label>

            <button
              onClick={onExportData}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold active:scale-98 transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <span>Exportar copia de seguridad (JSON)</span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold active:scale-98 transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurar desde archivo</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportData(file);
              }}
            />

            <button
              onClick={onResetSampleData}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold active:scale-98 transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Restablecer datos de muestra</span>
              </div>
            </button>
          </div>

          {/* Danger Zone */}
          <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <button
              onClick={onClearAll}
              className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 text-xs font-bold transition-all text-center"
            >
              Eliminar todos los gastos y empezar de cero
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className={`pt-3 border-t text-center ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
          <p className="text-[11px] flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Datos guardados localmente de forma privada en tu dispositivo</span>
          </p>
        </div>
      </div>
    </div>
  );
};
