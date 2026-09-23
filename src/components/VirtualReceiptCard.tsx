import React, { useState, useRef } from 'react';
import { 
  Download, 
  Share2, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  X, 
  Eye, 
  Palette,
  ExternalLink
} from 'lucide-react';
import { VirtualReceipt } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface VirtualReceiptCardProps {
  receipt: VirtualReceipt;
  onClose?: () => void;
  onSaveToExpenses?: (receipt: VirtualReceipt) => void;
  showSaveButton?: boolean;
}

export const VirtualReceiptCard: React.FC<VirtualReceiptCardProps> = ({
  receipt,
  onClose,
  onSaveToExpenses,
  showSaveButton = false,
}) => {
  const [backgroundTheme, setBackgroundTheme] = useState<'meadow' | 'studio' | 'sunset' | 'clean'>(
    (receipt.backgroundTheme as any) || 'meadow'
  );
  const [viewMode, setViewMode] = useState<'virtual' | 'real'>('virtual');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const textSummary = `🧾 Factura Virtual: ${receipt.merchantName}\nTotal: ${receipt.currency || '$'}${receipt.totalAmount.toFixed(2)}\nFecha: ${receipt.date} ${receipt.time || ''}\n${receipt.items.length} productos`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Factura Virtual ${receipt.merchantName}`,
          text: textSummary,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(textSummary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Export virtual receipt as printable window / image canvas
  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md sm:max-w-lg my-auto flex flex-col items-center">
        {/* Floating Top Controls */}
        <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 text-white rounded-2xl mb-3 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              Factura Virtual
            </span>

            {/* Toggle view if real photo is present */}
            {receipt.realPhotoUrl && (
              <div className="flex bg-slate-800 rounded-lg p-0.5 ml-2 text-[11px] font-semibold">
                <button
                  onClick={() => setViewMode('virtual')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    viewMode === 'virtual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Digital
                </button>
                <button
                  onClick={() => setViewMode('real')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    viewMode === 'real' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Foto Real
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Theme switcher */}
            {viewMode === 'virtual' && (
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 mr-1">
                <button
                  onClick={() => setBackgroundTheme('meadow')}
                  title="Fondo Flores & Cielo"
                  className={`w-5 h-5 rounded-full border transition-all ${
                    backgroundTheme === 'meadow'
                      ? 'border-white scale-110 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  } bg-gradient-to-tr from-sky-400 via-pink-400 to-emerald-400`}
                />
                <button
                  onClick={() => setBackgroundTheme('sunset')}
                  title="Fondo Atardecer"
                  className={`w-5 h-5 rounded-full border transition-all ${
                    backgroundTheme === 'sunset'
                      ? 'border-white scale-110 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  } bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500`}
                />
                <button
                  onClick={() => setBackgroundTheme('studio')}
                  title="Fondo Estudio Minimalista"
                  className={`w-5 h-5 rounded-full border transition-all ${
                    backgroundTheme === 'studio'
                      ? 'border-white scale-110 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  } bg-slate-700`}
                />
              </div>
            )}

            <button
              onClick={handleShare}
              title="Compartir o copiar"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              title="Imprimir / Exportar"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
            >
              <Download className="w-4 h-4" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                aria-label="Cerrar vista previa"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* RECEIPT STAGE CONTAINER */}
        <div
          ref={receiptRef}
          className={`relative w-full rounded-3xl p-4 sm:p-7 flex items-center justify-center overflow-hidden transition-all shadow-2xl ${
            backgroundTheme === 'meadow'
              ? 'bg-gradient-to-b from-[#7BB3F0] via-[#A8D3F9] to-[#DDF0C2]'
              : backgroundTheme === 'sunset'
              ? 'bg-gradient-to-b from-[#6366F1] via-[#EC4899] to-[#F59E0B]'
              : backgroundTheme === 'studio'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-slate-100'
          }`}
          style={{ minHeight: '620px' }}
        >
          {/* Aesthetic Meadow & Wildflower background decorative art (Matching user photo) */}
          {backgroundTheme === 'meadow' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {/* Soft clouds */}
              <div className="absolute -top-6 -left-10 w-48 h-32 bg-white/40 rounded-full blur-2xl" />
              <div className="absolute top-10 right-0 w-64 h-36 bg-white/30 rounded-full blur-2xl" />

              {/* Pink Cosmos Flowers art in bottom overlay */}
              <svg
                className="absolute -bottom-2 -left-6 w-48 h-56 text-pink-500/70"
                viewBox="0 0 100 120"
                fill="none"
              >
                <path d="M50 120 C45 80 52 50 48 30" stroke="#4ade80" strokeWidth="2.5" />
                <path d="M48 30 C30 20 20 40 48 30" fill="#f43f5e" opacity="0.85" />
                <path d="M48 30 C65 20 75 40 48 30" fill="#fb7185" opacity="0.85" />
                <path d="M48 30 C40 10 56 10 48 30" fill="#e11d48" opacity="0.85" />
                <circle cx="48" cy="30" r="4" fill="#facc15" />
              </svg>

              <svg
                className="absolute -bottom-3 -right-6 w-52 h-64 text-pink-600/80"
                viewBox="0 0 100 120"
                fill="none"
              >
                <path d="M45 120 C50 85 45 45 52 25" stroke="#22c55e" strokeWidth="2.5" />
                <path d="M52 25 C35 15 25 35 52 25" fill="#f43f5e" opacity="0.9" />
                <path d="M52 25 C70 15 78 35 52 25" fill="#fda4af" opacity="0.9" />
                <path d="M52 25 C45 5 60 5 52 25" fill="#be123c" opacity="0.9" />
                <circle cx="52" cy="25" r="4.5" fill="#fef08a" />
              </svg>
            </div>
          )}

          {/* VIEW MODE 1: THE VIRTUAL DIGITAL RECEIPT (Pixel-perfect match to user sketch) */}
          {viewMode === 'virtual' ? (
            <div
              className="relative w-full max-w-[340px] sm:max-w-[370px] bg-[#FEFDF9] text-[#003893] rounded-[18px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)] font-mono transition-transform duration-300 transform -rotate-1 hover:rotate-0"
              style={{
                boxShadow:
                  '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0,0,0,0.04)',
                background:
                  'linear-gradient(180deg, #FFFFFF 0%, #FAF8F2 100%)',
              }}
            >
              {/* Paper tear simulation at top */}
              <div className="absolute -top-1.5 left-0 right-0 h-2 flex justify-between overflow-hidden opacity-30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-[#7BB3F0] rotate-45 transform origin-center shrink-0 -translate-y-2"
                  />
                ))}
              </div>

              {/* RECEIPT HEADER: STORE TITLE */}
              <div className="text-center pt-2 pb-3">
                <h2
                  className="text-2xl sm:text-3xl font-black tracking-wider text-[#003893] uppercase font-sans"
                  style={{
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {receipt.merchantName || 'GRAN AKi CAYAMBE'}
                </h2>
              </div>

              {/* DOTTED SEPARATOR */}
              <div className="border-b-2 border-dotted border-[#003893]/35 my-2.5" />

              {/* TABLE COLUMN HEADERS */}
              <div className="grid grid-cols-12 text-[10px] sm:text-[11px] font-bold text-[#003893] uppercase tracking-wider mb-2">
                <div className="col-span-7 text-left">PURCHASED SERVICES</div>
                <div className="col-span-2 text-center">AMOUNT</div>
                <div className="col-span-3 text-right">PRICE</div>
              </div>

              {/* ITEMS LIST */}
              <div className="space-y-1.5 max-h-[290px] overflow-y-auto no-scrollbar pr-1 text-xs">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="grid grid-cols-12 items-center text-[11px] sm:text-xs text-[#003893] font-semibold"
                    >
                      <div className="col-span-7 text-left flex items-center min-w-0 pr-1">
                        <span className="text-[#6894E2] text-[10px] mr-1.5 tabular-nums shrink-0">
                          {item.id || String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate uppercase tracking-tight">
                          {item.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-center tabular-nums font-bold">
                        {item.quantity}
                      </div>
                      <div className="col-span-3 text-right tabular-nums font-bold">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-2 opacity-60">
                    Sin detalle de artículos
                  </p>
                )}
              </div>

              {/* DOTTED SEPARATOR */}
              <div className="border-b-2 border-dotted border-[#003893]/35 my-3" />

              {/* TOTALS SECTION */}
              <div className="space-y-1 text-xs font-semibold text-[#003893]">
                {receipt.subtotal !== undefined && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="tracking-tight">SUBTOTAL (sin IVA):</span>
                    <span className="tabular-nums font-bold">
                      ${receipt.subtotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {receipt.taxAmount !== undefined && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="tracking-tight">
                      IVA ({receipt.taxRate || 15}%):
                    </span>
                    <span className="tabular-nums font-bold">
                      ${receipt.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-sm sm:text-base font-black text-[#003893]">
                  <span className="tracking-wider">TOTAL AMOUNT:</span>
                  <span className="tabular-nums">
                    ${receipt.totalAmount.toFixed(2)} {receipt.currency === '$' ? 'USD' : receipt.currency || 'USD'}
                  </span>
                </div>
              </div>

              {/* DOTTED SEPARATOR */}
              <div className="border-b-2 border-dotted border-[#003893]/35 my-3" />

              {/* METADATA: DATE, TIME, REGISTER/CASHIER */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#003893] mb-3">
                <span>{receipt.date}</span>
                <span>{receipt.time || '02:46 PM'}</span>
                <span>{receipt.cashier || 'Caja: B001'}</span>
              </div>

              {/* HIGH FIDELITY BLUE BARCODE GRAPHIC */}
              <div className="flex justify-center items-center my-3 px-2">
                <div className="w-full flex items-center justify-center gap-[2px] sm:gap-[2.5px] h-11 bg-transparent py-1">
                  {[
                    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1,
                    2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 4, 1, 2, 1, 3, 2
                  ].map((w, idx) => (
                    <div
                      key={idx}
                      className="h-full bg-[#003893] rounded-2xs"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* FOOTER: STORE ADDRESS & DETAILS */}
              <div className="text-center text-[10px] text-[#003893] leading-tight font-medium pt-1 opacity-90">
                <p className="font-bold tracking-wider uppercase mb-0.5">
                  {receipt.clientName ? 'PUBBLES PET PARLOR' : receipt.merchantName}
                </p>
                <p>
                  {receipt.address || 'Av. General Enríquez Vía Cotogchoa'}
                </p>
                <p className="mt-0.5 font-semibold">Cayambe - Ecuador</p>
              </div>

              {/* Bottom paper tear simulation */}
              <div className="absolute -bottom-1.5 left-0 right-0 h-2 flex justify-between overflow-hidden opacity-30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-[#7BB3F0] rotate-45 transform origin-center shrink-0 translate-y-1"
                  />
                ))}
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: REAL PHOTO FROM USER'S CAMERA */
            <div className="relative w-full max-w-[340px] sm:max-w-[370px] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center">
              <img
                src={receipt.realPhotoUrl}
                alt="Ticket Real Fotografiado"
                className="w-full max-h-[520px] object-contain"
              />
              <div className="p-3 bg-slate-900/90 w-full text-center text-xs text-white">
                <p className="font-bold">Foto original capturada</p>
                <p className="text-[11px] text-slate-400">
                  Procesada con IA para generar la factura digital
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Guardar en Mis Gastos */}
        {showSaveButton && onSaveToExpenses && (
          <button
            onClick={() => onSaveToExpenses(receipt)}
            className="w-full mt-3 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              Registrar Gasto de ${receipt.totalAmount.toFixed(2)} en Mis Gastos
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
