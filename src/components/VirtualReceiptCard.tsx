import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  X, 
  Eye, 
  Palette,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2
} from 'lucide-react';
import { VirtualReceipt, ReceiptItem } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { resolvePhotoUrl } from '../utils/storage.ts';

interface VirtualReceiptCardProps {
  receipt: VirtualReceipt;
  onClose?: () => void;
  onSaveToExpenses?: (receipt: VirtualReceipt) => void;
  onUpdateReceipt?: (updatedReceipt: VirtualReceipt) => void;
  showSaveButton?: boolean;
}

export const VirtualReceiptCard: React.FC<VirtualReceiptCardProps> = ({
  receipt,
  onClose,
  onSaveToExpenses,
  onUpdateReceipt,
  showSaveButton = false,
}) => {
  const [backgroundTheme, setBackgroundTheme] = useState<'meadow' | 'studio' | 'sunset' | 'clean'>(
    (receipt.backgroundTheme as any) || 'meadow'
  );
  const [viewMode, setViewMode] = useState<'virtual' | 'real'>('virtual');
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | undefined>(receipt.realPhotoUrl);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  // Editable local state
  const [formData, setFormData] = useState<VirtualReceipt>(receipt);
  const [autoRecalculate, setAutoRecalculate] = useState(true);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Sync formData whenever receipt prop changes
  useEffect(() => {
    setFormData(receipt);
  }, [receipt]);

  useEffect(() => {
    let isMounted = true;
    if (receipt.realPhotoUrl && receipt.realPhotoUrl.startsWith('idb:')) {
      resolvePhotoUrl(receipt.realPhotoUrl).then((url) => {
        if (isMounted && url) {
          setResolvedPhotoUrl(url);
        }
      });
    } else {
      setResolvedPhotoUrl(receipt.realPhotoUrl);
    }
    return () => {
      isMounted = false;
    };
  }, [receipt.realPhotoUrl]);

  // Recalculate totals from items
  const recalculateTotals = (items: ReceiptItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount,
      totalAmount,
    };
  };

  // Item change handlers
  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const currentItem = { ...updatedItems[index] };

      if (field === 'quantity') {
        const qty = Math.max(1, Number(value) || 1);
        currentItem.quantity = qty;
        if (currentItem.unitPrice) {
          currentItem.totalPrice = Number((qty * currentItem.unitPrice).toFixed(2));
        }
      } else if (field === 'totalPrice') {
        const total = Math.max(0, Number(value) || 0);
        currentItem.totalPrice = total;
        if (currentItem.quantity > 0) {
          currentItem.unitPrice = Number((total / currentItem.quantity).toFixed(2));
        }
      } else if (field === 'unitPrice') {
        const unit = Math.max(0, Number(value) || 0);
        currentItem.unitPrice = unit;
        currentItem.totalPrice = Number((unit * (currentItem.quantity || 1)).toFixed(2));
      } else {
        (currentItem as any)[field] = value;
      }

      updatedItems[index] = currentItem;

      let totals = {
        subtotal: prev.subtotal,
        taxAmount: prev.taxAmount,
        totalAmount: prev.totalAmount,
      };

      if (autoRecalculate) {
        totals = recalculateTotals(updatedItems, prev.taxRate ?? 15);
      }

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => {
      const newId = String(prev.items.length + 1).padStart(2, '0');
      const newItem: ReceiptItem = {
        id: newId,
        name: 'NUEVO PRODUCTO',
        quantity: 1,
        unitPrice: 1.0,
        totalPrice: 1.0,
      };
      const updatedItems = [...prev.items, newItem];
      const totals = autoRecalculate
        ? recalculateTotals(updatedItems, prev.taxRate ?? 15)
        : { subtotal: prev.subtotal, taxAmount: prev.taxAmount, totalAmount: prev.totalAmount };

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const totals = autoRecalculate
        ? recalculateTotals(updatedItems, prev.taxRate ?? 15)
        : { subtotal: prev.subtotal, taxAmount: prev.taxAmount, totalAmount: prev.totalAmount };

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const handleTaxRateChange = (rateStr: string) => {
    const rate = Math.max(0, Number(rateStr) || 0);
    setFormData((prev) => {
      const subtotal = prev.subtotal ?? 0;
      const taxAmount = Number(((subtotal * rate) / 100).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));
      return {
        ...prev,
        taxRate: rate,
        taxAmount,
        totalAmount,
      };
    });
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    if (onUpdateReceipt) {
      onUpdateReceipt(formData);
    }
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleCancelEditing = () => {
    setFormData(receipt);
    setIsEditing(false);
  };

  const handleShare = async () => {
    const currentData = isEditing ? formData : receipt;
    const textSummary = `🧾 Factura Virtual: ${currentData.merchantName}\nTotal: ${currentData.currency || '$'}${currentData.totalAmount.toFixed(2)}\nFecha: ${currentData.date} ${currentData.time || ''}\n${currentData.items.length} productos`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Factura Virtual ${currentData.merchantName}`,
          text: textSummary,
        });
      } catch {
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

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  const currentDisplay = isEditing ? formData : receipt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md sm:max-w-lg my-auto flex flex-col items-center">
        {/* Success Alert Toast */}
        {savedAlert && (
          <div className="w-full mb-2 py-2 px-3 bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Factura actualizada y guardada correctamente</span>
          </div>
        )}

        {/* Floating Top Controls */}
        <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 text-white rounded-2xl mb-3 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              Factura Virtual
            </span>

            {/* View Mode Toggle (Digital vs Real Photo) */}
            {resolvedPhotoUrl && !isEditing && (
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
            {/* Edit / Save Toggle Button */}
            {viewMode === 'virtual' && (
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveChanges();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isEditing
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Guardar</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </>
                )}
              </button>
            )}

            {isEditing && (
              <button
                onClick={handleCancelEditing}
                title="Descartar cambios"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Theme switcher */}
            {viewMode === 'virtual' && !isEditing && (
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 mx-1">
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

            {!isEditing && (
              <>
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
              </>
            )}

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

        {/* Informative editing banner */}
        {isEditing && (
          <div className="w-full mb-2 px-3 py-1.5 bg-blue-600/90 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modo Edición activo: Haz clic en cualquier campo para corregirlo</span>
            </div>
            <label className="flex items-center gap-1 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={autoRecalculate}
                onChange={(e) => setAutoRecalculate(e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Auto-totales</span>
            </label>
          </div>
        )}

        {/* RECEIPT STAGE CONTAINER */}
        <div
          ref={receiptRef}
          className={`relative w-full rounded-3xl p-3 sm:p-7 flex items-center justify-center overflow-hidden transition-all shadow-2xl ${
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
          {/* Aesthetic Meadow & Wildflower background decorative art */}
          {backgroundTheme === 'meadow' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <div className="absolute -top-6 -left-10 w-48 h-32 bg-white/40 rounded-full blur-2xl" />
              <div className="absolute top-10 right-0 w-64 h-36 bg-white/30 rounded-full blur-2xl" />

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

          {/* VIEW MODE 1: THE VIRTUAL DIGITAL RECEIPT */}
          {viewMode === 'virtual' ? (
            <div
              className={`relative w-full max-w-[340px] sm:max-w-[370px] bg-[#FEFDF9] text-[#003893] rounded-[18px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)] font-mono transition-transform duration-300 ${
                isEditing ? 'ring-4 ring-blue-500/40 rotate-0' : 'transform -rotate-1 hover:rotate-0'
              }`}
              style={{
                boxShadow:
                  '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0,0,0,0.04)',
                background:
                  'linear-gradient(180deg, #FFFFFF 0%, #FAF8F2 100%)',
              }}
            >
              {/* Paper tear simulation at top */}
              <div className="absolute -top-1.5 left-0 right-0 h-2 flex justify-between overflow-hidden opacity-30 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-[#7BB3F0] rotate-45 transform origin-center shrink-0 -translate-y-2"
                  />
                ))}
              </div>

              {/* RECEIPT HEADER: STORE TITLE */}
              <div className="text-center pt-2 pb-2">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block text-left">
                      Nombre del Comercio / Tienda:
                    </label>
                    <input
                      type="text"
                      value={formData.merchantName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, merchantName: e.target.value.toUpperCase() }))
                      }
                      placeholder="GRAN AKI CAYAMBE"
                      className="w-full text-center text-xl sm:text-2xl font-black uppercase text-[#003893] bg-blue-50/60 border border-blue-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-400 font-sans"
                    />
                  </div>
                ) : (
                  <h2
                    className="text-2xl sm:text-3xl font-black tracking-wider text-[#003893] uppercase font-sans"
                    style={{
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {currentDisplay.merchantName || 'GRAN AKi CAYAMBE'}
                  </h2>
                )}
              </div>

              {/* DOTTED SEPARATOR */}
              <div className="border-b-2 border-dotted border-[#003893]/35 my-2.5" />

              {/* TABLE COLUMN HEADERS */}
              <div className="grid grid-cols-12 text-[10px] sm:text-[11px] font-bold text-[#003893] uppercase tracking-wider mb-2">
                <div className={isEditing ? 'col-span-6 text-left' : 'col-span-7 text-left'}>
                  PURCHASED SERVICES
                </div>
                <div className={isEditing ? 'col-span-2 text-center' : 'col-span-2 text-center'}>
                  CANT
                </div>
                <div className={isEditing ? 'col-span-3 text-right' : 'col-span-3 text-right'}>
                  PRECIO
                </div>
                {isEditing && <div className="col-span-1 text-center"></div>}
              </div>

              {/* ITEMS LIST */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1 text-xs">
                {currentDisplay.items && currentDisplay.items.length > 0 ? (
                  currentDisplay.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`items-center text-[11px] sm:text-xs text-[#003893] font-semibold ${
                        isEditing
                          ? 'grid grid-cols-12 gap-1 bg-blue-50/40 p-1 rounded-lg border border-blue-100'
                          : 'grid grid-cols-12'
                      }`}
                    >
                      {/* Name / Description */}
                      <div className={isEditing ? 'col-span-6' : 'col-span-7 text-left flex items-center min-w-0 pr-1'}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value.toUpperCase())}
                            placeholder="PRODUCTO"
                            className="w-full bg-white border border-blue-200 rounded px-1.5 py-0.5 text-[11px] uppercase font-bold text-[#003893] outline-none focus:border-blue-500"
                          />
                        ) : (
                          <>
                            <span className="text-[#6894E2] text-[10px] mr-1.5 tabular-nums shrink-0">
                              {item.id || String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="truncate uppercase tracking-tight">
                              {item.name}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className={isEditing ? 'col-span-2 text-center' : 'col-span-2 text-center tabular-nums font-bold'}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full text-center bg-white border border-blue-200 rounded px-1 py-0.5 text-[11px] font-bold text-[#003893] outline-none focus:border-blue-500"
                          />
                        ) : (
                          item.quantity
                        )}
                      </div>

                      {/* Total Price */}
                      <div className={isEditing ? 'col-span-3 text-right' : 'col-span-3 text-right tabular-nums font-bold'}>
                        {isEditing ? (
                          <div className="relative flex items-center justify-end">
                            <span className="text-[10px] text-blue-400 mr-0.5">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.totalPrice}
                              onChange={(e) => handleItemChange(index, 'totalPrice', e.target.value)}
                              className="w-14 text-right bg-white border border-blue-200 rounded px-1 py-0.5 text-[11px] font-bold text-[#003893] outline-none focus:border-blue-500"
                            />
                          </div>
                        ) : (
                          `$${Number(item.totalPrice).toFixed(2)}`
                        )}
                      </div>

                      {/* Delete item button in edit mode */}
                      {isEditing && (
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            title="Eliminar producto"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-2 opacity-60">
                    Sin detalle de artículos
                  </p>
                )}
              </div>

              {/* Add item button in edit mode */}
              {isEditing && (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-1.5 px-3 bg-blue-100/70 hover:bg-blue-200/70 text-[#003893] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-dashed border-blue-300 transition-all active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Agregar Producto Faltante</span>
                  </button>
                </div>
              )}

              {/* DOTTED SEPARATOR */}
              <div className="border-b-2 border-dotted border-[#003893]/35 my-3" />

              {/* TOTALS SECTION */}
              <div className="space-y-1.5 text-xs font-semibold text-[#003893]">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="tracking-tight">SUBTOTAL (sin IVA):</span>
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="text-[10px] text-blue-400 mr-0.5">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.subtotal}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subtotal: Number(e.target.value) || 0,
                            totalAmount: Number(
                              ((Number(e.target.value) || 0) + (prev.taxAmount || 0)).toFixed(2)
                            ),
                          }))
                        }
                        className="w-18 text-right bg-white border border-blue-200 rounded px-1 py-0.5 text-xs font-bold text-[#003893] outline-none"
                      />
                    </div>
                  ) : (
                    <span className="tabular-nums font-bold">
                      ${Number(currentDisplay.subtotal || 0).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Tax / IVA */}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="tracking-tight flex items-center gap-1">
                    <span>IVA:</span>
                    {isEditing ? (
                      <div className="inline-flex items-center">
                        <input
                          type="number"
                          value={formData.taxRate ?? 15}
                          onChange={(e) => handleTaxRateChange(e.target.value)}
                          className="w-10 text-center bg-white border border-blue-200 rounded px-1 py-0.2 text-[10px] font-bold text-[#003893]"
                        />
                        <span className="text-[10px] ml-0.5">%</span>
                      </div>
                    ) : (
                      `(${currentDisplay.taxRate || 15}%):`
                    )}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="text-[10px] text-blue-400 mr-0.5">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxAmount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            taxAmount: Number(e.target.value) || 0,
                            totalAmount: Number(
                              ((prev.subtotal || 0) + (Number(e.target.value) || 0)).toFixed(2)
                            ),
                          }))
                        }
                        className="w-18 text-right bg-white border border-blue-200 rounded px-1 py-0.5 text-xs font-bold text-[#003893] outline-none"
                      />
                    </div>
                  ) : (
                    <span className="tabular-nums font-bold">
                      ${Number(currentDisplay.taxAmount || 0).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center pt-2 text-sm sm:text-base font-black text-[#003893]">
                  <span className="tracking-wider">TOTAL AMOUNT:</span>
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="text-xs text-blue-400 mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            totalAmount: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-24 text-right bg-blue-100/60 border-2 border-blue-300 rounded-lg px-2 py-1 text-base font-black text-[#003893] outline-none"
                      />
                    </div>
                  ) : (
                    <span className="tabular-nums">
                      ${Number(currentDisplay.totalAmount).toFixed(2)}{' '}
                      {currentDisplay.currency === '$' ? 'USD' : currentDisplay.currency || 'USD'}
                    </span>
                  )}
                </div>
              </div>

              {/* DOTTED SEPARATOR */}
              <div className="border-b-2 border-dotted border-[#003893]/35 my-3" />

              {/* METADATA: DATE, TIME, REGISTER/CASHIER */}
              {isEditing ? (
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-[#003893] mb-3">
                  <div>
                    <label className="block text-[9px] text-slate-400">Fecha:</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      placeholder="YYYY-MM-DD"
                      className="w-full bg-white border border-blue-200 rounded px-1 py-0.5 text-[10px] font-bold text-[#003893]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400">Hora:</label>
                    <input
                      type="text"
                      value={formData.time || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      placeholder="02:46 PM"
                      className="w-full bg-white border border-blue-200 rounded px-1 py-0.5 text-[10px] font-bold text-[#003893]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400">Caja / Registro:</label>
                    <input
                      type="text"
                      value={formData.cashier || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cashier: e.target.value }))}
                      placeholder="Caja: B001"
                      className="w-full bg-white border border-blue-200 rounded px-1 py-0.5 text-[10px] font-bold text-[#003893]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#003893] mb-3">
                  <span>{currentDisplay.date}</span>
                  <span>{currentDisplay.time || '02:46 PM'}</span>
                  <span>{currentDisplay.cashier || 'Caja: B001'}</span>
                </div>
              )}

              {/* HIGH FIDELITY BLUE BARCODE GRAPHIC */}
              <div className="flex justify-center items-center my-3 px-2">
                <div className="w-full flex items-center justify-center gap-[2px] sm:gap-[2.5px] h-10 bg-transparent py-1">
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
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Dirección / Ubicación"
                      className="w-full text-center bg-white border border-blue-200 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#003893]"
                    />
                    <input
                      type="text"
                      value={formData.clientName || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value.toUpperCase() }))}
                      placeholder="Cliente / RUC"
                      className="w-full text-center bg-white border border-blue-200 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#003893]"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-bold tracking-wider uppercase mb-0.5">
                      {currentDisplay.clientName ? currentDisplay.merchantName : currentDisplay.merchantName}
                    </p>
                    <p>
                      {currentDisplay.address || 'Av. General Enríquez Vía Cotogchoa'}
                    </p>
                    <p className="mt-0.5 font-semibold">Cayambe - Ecuador</p>
                  </>
                )}
              </div>

              {/* Bottom paper tear simulation */}
              <div className="absolute -bottom-1.5 left-0 right-0 h-2 flex justify-between overflow-hidden opacity-30 pointer-events-none">
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
                src={resolvedPhotoUrl || receipt.realPhotoUrl}
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

        {/* Footer Actions: Save edits or Register as Expense */}
        {isEditing ? (
          <div className="w-full mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleCancelEditing}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Descartar</span>
            </button>
            <button
              onClick={handleSaveChanges}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Factura</span>
            </button>
          </div>
        ) : showSaveButton && onSaveToExpenses ? (
          <button
            onClick={() => onSaveToExpenses(currentDisplay)}
            className="w-full mt-3 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              Registrar Gasto de ${Number(currentDisplay.totalAmount).toFixed(2)} en Mis Gastos
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
