import React from 'react';
import { Home, ReceiptText, Camera, BarChart2, MoreHorizontal } from 'lucide-react';
import { ActiveTab } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenScanner: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenScanner,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl transition-all duration-300 ${
        isDark
          ? 'bg-[#070E1C]/80 border-t border-white/15 text-slate-300 shadow-[0_-8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]'
          : 'bg-white/75 border-t border-white/80 text-slate-700 shadow-[0_-8px_32px_rgba(15,23,42,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.9)]'
      }`}
    >
      <div className="max-w-md mx-auto px-3 h-20 flex items-center justify-between relative pb-safe">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => onTabChange('inicio')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'inicio'
                ? isDark
                  ? 'text-white'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 group-hover:text-slate-200'
                : 'text-slate-500 group-hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span
            className={`text-[11px] mt-1 tracking-tight transition-colors ${
              activeTab === 'inicio'
                ? isDark
                  ? 'text-white font-black'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 font-semibold group-hover:text-slate-200'
                : 'text-slate-500 font-semibold group-hover:text-slate-900'
            }`}
          >
            Inicio
          </span>
        </button>

        {/* Tab 2: Gastos */}
        <button
          onClick={() => onTabChange('gastos')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'gastos'
                ? isDark
                  ? 'text-white'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 group-hover:text-slate-200'
                : 'text-slate-500 group-hover:text-slate-900'
            }`}
          >
            <ReceiptText className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span
            className={`text-[11px] mt-1 tracking-tight transition-colors ${
              activeTab === 'gastos'
                ? isDark
                  ? 'text-white font-black'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 font-semibold group-hover:text-slate-200'
                : 'text-slate-500 font-semibold group-hover:text-slate-900'
            }`}
          >
            Gastos
          </span>
        </button>

        {/* Center: Camera Scanner Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenScanner}
            aria-label="Escanear ticket o recibo con cámara"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all ${
              isDark
                ? 'bg-white text-slate-950 shadow-white/20 hover:bg-slate-100 ring-4 ring-[#070E1C]'
                : 'bg-slate-950 text-white shadow-slate-950/30 hover:bg-slate-900 ring-4 ring-white'
            }`}
          >
            <Camera className="w-6 h-6 stroke-[2.4]" />
          </button>
        </div>

        {/* Tab 3: Estadísticas */}
        <button
          onClick={() => onTabChange('estadisticas')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'estadisticas'
                ? isDark
                  ? 'text-white'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 group-hover:text-slate-200'
                : 'text-slate-500 group-hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span
            className={`text-[11px] mt-1 tracking-tight transition-colors ${
              activeTab === 'estadisticas'
                ? isDark
                  ? 'text-white font-black'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 font-semibold group-hover:text-slate-200'
                : 'text-slate-500 font-semibold group-hover:text-slate-900'
            }`}
          >
            Estadísticas
          </span>
        </button>

        {/* Tab 4: Más */}
        <button
          onClick={() => onTabChange('mas')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'mas'
                ? isDark
                  ? 'text-white'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 group-hover:text-slate-200'
                : 'text-slate-500 group-hover:text-slate-900'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span
            className={`text-[11px] mt-1 tracking-tight transition-colors ${
              activeTab === 'mas'
                ? isDark
                  ? 'text-white font-black'
                  : 'text-slate-950 font-black'
                : isDark
                ? 'text-slate-400 font-semibold group-hover:text-slate-200'
                : 'text-slate-500 font-semibold group-hover:text-slate-900'
            }`}
          >
            Más
          </span>
        </button>
      </div>
    </nav>
  );
};
