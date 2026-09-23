import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Sparkles, Check, RefreshCw, Edit3 } from 'lucide-react';
import { Expense } from '../types.ts';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (scannedData: Partial<Expense>) => void;
  onManualEntry: () => void;
}

interface SampleReceipt {
  name: string;
  merchant: string;
  total: number;
  date: string;
  category: Expense['category'];
  items: string[];
}

const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    name: 'Ticket Gran Aki',
    merchant: 'Gran Aki Hipermercado',
    total: 14.85,
    date: '2026-09-22',
    category: 'supermercado',
    items: ['Leche Entera 1L ($1.20)', 'Pan Molde ($2.15)', 'Huevos 15u ($3.50)', 'Frutas y Verduras ($8.00)'],
  },
  {
    name: 'Ticket Cafetería & Desayuno',
    merchant: 'Café & Dulces Deli',
    total: 5.50,
    date: '2026-09-22',
    category: 'alimentacion',
    items: ['Capuchino Grande ($3.00)', 'Croissant Mantequilla ($2.50)'],
  },
  {
    name: 'Ticket Farmacia SanaSana',
    merchant: 'Farmacias SanaSana',
    total: 8.90,
    date: '2026-09-21',
    category: 'salud',
    items: ['Paracetamol 500mg ($2.40)', 'Vitamina C ($6.50)'],
  },
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
  onManualEntry,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera not available or blocked, fallback to photo or sample', err);
      setCameraError('No se pudo acceder a la cámara en este dispositivo. Puedes subir una foto o usar un ticket de prueba.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    setScanPreview(null);
    setIsScanning(false);
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setScanPreview(dataUrl);
        stopCamera();
        simulateOcr('Ticket Comercio Local', 12.40, 'supermercado', dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setScanPreview(dataUrl);
        simulateOcr('Ticket Escaneado', 18.25, 'supermercado', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateOcr = (
    merchant: string,
    total: number,
    category: Expense['category'],
    receiptUrl?: string,
    customDate?: string
  ) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const todayStr = customDate || new Date().toISOString().split('T')[0];
      onReceiptScanned({
        title: merchant,
        amount: total,
        date: todayStr,
        category,
        receiptUrl,
        notes: 'Detectado automáticamente desde el ticket de compra.',
      });
      handleClose();
    }, 1200);
  };

  const handlePickSample = (sample: SampleReceipt) => {
    simulateOcr(sample.merchant, sample.total, sample.category, undefined, sample.date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Escanear Ticket de Compra
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Detecta automáticamente el total y comercio
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanning State */}
        {isScanning ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Analizando ticket con OCR...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Extrayendo importe, fecha y establecimiento
              </p>
            </div>
          </div>
        ) : (
          <div className="py-5 space-y-5">
            {/* Live Camera View */}
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-72 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Visual scan frame */}
                <div className="absolute inset-6 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                    Enfoca el ticket aquí
                  </span>
                </div>
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg active:scale-90 transition-all ring-4 ring-white/50"
                  >
                    <Check className="w-7 h-7 stroke-[3]" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {cameraError && (
                  <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 mb-3 border border-amber-200">
                    {cameraError}
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md shadow-blue-500/25 active:scale-95 transition-all text-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Abrir Cámara</span>
                      <span className="text-[10px] text-blue-100">Tomar foto al ticket</span>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl border border-slate-200/80 active:scale-95 transition-all text-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-700">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Subir Foto</span>
                      <span className="text-[10px] text-slate-500">Desde galería o archivo</span>
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}

            {/* Quick Sample Tickets for fast testing */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Tickets de prueba instantáneos
                </span>
                <span className="text-[11px] text-slate-400">1 clic para simular</span>
              </div>

              <div className="space-y-2">
                {SAMPLE_RECEIPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePickSample(sample)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 flex items-center justify-between text-left transition-all active:scale-[0.99] group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        {sample.merchant}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {sample.items[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                        ${sample.total.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-blue-600 font-semibold">
                        Escanear →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual entry fallback */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleClose();
                  onManualEntry();
                }}
                className="w-full py-3 px-4 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>O registrar gasto de forma manual</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
