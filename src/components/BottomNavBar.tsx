import React from 'react';
import { Home, ReceiptText, Camera, Tag, MoreHorizontal } from 'lucide-react';
import { ActiveTab } from '../types.ts';

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
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="max-w-md mx-auto px-4 h-20 flex items-center justify-between relative pb-safe">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => onTabChange('inicio')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'inicio' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight transition-colors ${
              activeTab === 'inicio' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
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
              activeTab === 'gastos' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            <ReceiptText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight transition-colors ${
              activeTab === 'gastos' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            Gastos
          </span>
        </button>

        {/* Center: Camera Scanner Button (Elevated) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenScanner}
            aria-label="Escanear ticket o recibo con cámara"
            className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:bg-blue-700 active:scale-90 transition-all ring-4 ring-white"
          >
            <Camera className="w-7 h-7 stroke-[2.2]" />
          </button>
        </div>

        {/* Tab 4: Categorías */}
        <button
          onClick={() => onTabChange('categorias')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'categorias' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            <Tag className="w-5 h-5 stroke-[2.2] -rotate-45" />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight transition-colors ${
              activeTab === 'categorias' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            Categorías
          </span>
        </button>

        {/* Tab 5: Más / Ahorro */}
        <button
          onClick={() => onTabChange('mas')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              activeTab === 'mas' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 tracking-tight transition-colors ${
              activeTab === 'mas' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
            }`}
          >
            Más
          </span>
        </button>
      </div>
    </nav>
  );
};
