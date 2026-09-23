import React from 'react';
import { X, RotateCcw, Download, Upload, Shield, Info, DollarSign } from 'lucide-react';

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
  if (!isOpen) return null;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currencies = [
    { symbol: '$', code: 'USD', name: 'Dólar Estadounidense ($)' },
    { symbol: '€', code: 'EUR', name: 'Euro (€)' },
    { symbol: 'S/', code: 'PEN', name: 'Sol Peruano (S/)' },
    { symbol: 'Mex$', code: 'MXN', name: 'Peso Mexicano (Mex$)' },
    { symbol: 'Col$', code: 'COP', name: 'Peso Colombiano (Col$)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Ajustes y Preferencias
            </h3>
            <p className="text-xs text-slate-400">
              Personaliza tu experiencia de control y ahorro
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Moneda Principal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.symbol}
                  onClick={() => onChangeCurrency(curr.symbol)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                    currencySymbol === curr.symbol
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-extrabold mr-1">{curr.symbol}</span>
                  <span className="text-[11px] text-slate-500">{curr.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              Gestión de Datos y Respaldo
            </label>

            <button
              onClick={onExportData}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-500" />
                <span>Exportar copia de seguridad (JSON)</span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-500" />
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
              className="w-full p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 flex items-center justify-between text-xs font-bold text-blue-700 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Restaurar datos del boceto original</span>
              </div>
              <span className="text-[10px] bg-blue-200/60 px-2 py-0.5 rounded-full text-blue-800">
                Sept 2026
              </span>
            </button>
          </div>

          {/* App info */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-slate-800">
              Mis Gastos & Ahorro
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inspirado fielmente en el boceto móvil del usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
