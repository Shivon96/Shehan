import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, ScanLine, Plus, Minus, Printer, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { playSuccessBeep, playErrorBeep, playClickBeep } from '../utils/audio';

interface SimpleScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onDeductItem: (item: InventoryItem) => void;
  onRestockItem: (item: InventoryItem) => void;
  onPrintItem: (item: InventoryItem) => void;
  onAddNewWithBarcode: (barcode: string) => void;
}

export const SimpleScannerModal: React.FC<SimpleScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  onDeductItem,
  onRestockItem,
  onPrintItem,
  onAddNewWithBarcode,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Keep matchedItem up to date if items list updates (e.g. quantity changes)
  useEffect(() => {
    if (matchedItem) {
      const updated = items.find((i) => i.id === matchedItem.id);
      if (updated) setMatchedItem(updated);
    }
  }, [items]);

  const handleProcessCode = (scannedCode: string) => {
    const code = scannedCode.trim();
    if (!code) return;

    // Debounce rapid duplicates
    const now = Date.now();
    if (now - lastScannedTimeRef.current < 1200) return;
    lastScannedTimeRef.current = now;

    const found = items.find(
      (it) =>
        it.barcode.toLowerCase() === code.toLowerCase() ||
        it.sku.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      playSuccessBeep();
      setMatchedItem(found);
      setUnrecognizedCode(null);
    } else {
      playErrorBeep();
      setMatchedItem(null);
      setUnrecognizedCode(code);
    }
  };

  // Start / Stop camera scanner
  useEffect(() => {
    if (!isOpen) {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current?.clear();
            html5QrCodeRef.current = null;
            setIsScanning(false);
          });
      }
      setMatchedItem(null);
      setUnrecognizedCode(null);
      setCameraError(null);
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      try {
        setCameraError(null);
        const qr = new Html5Qrcode('simple-scanner-viewfinder', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
        html5QrCodeRef.current = qr;

        await qr.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(minEdge * 0.85),
                height: Math.floor(minEdge * 0.55),
              };
            },
          },
          (decodedText) => {
            if (isMounted) {
              handleProcessCode(decodedText);
            }
          },
          () => {} // frame error ignore
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: any) {
        console.warn('Camera start error:', err);
        if (isMounted) {
          setCameraError(
            'Camera preview unavailable. You can enter or paste the barcode number below.'
          );
          setIsScanning(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startCamera();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current?.clear();
            html5QrCodeRef.current = null;
          });
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="simple-scanner-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
    >
      <div
        id="simple-scanner-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700 text-slate-100 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">Scan Part Barcode</h2>
          </div>
          <button
            id="btn-close-scanner"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="p-3 bg-black flex flex-col items-center justify-center relative min-h-[220px]">
          <div
            id="simple-scanner-viewfinder"
            className="w-full max-w-[340px] h-[190px] overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800"
          />

          {cameraError && (
            <div className="absolute inset-x-4 top-6 p-3 rounded-lg bg-slate-900/95 border border-amber-600/50 text-amber-200 text-xs text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Point camera at the barcode on the part box or bin
          </p>
        </div>

        {/* Manual Barcode Input */}
        <div className="px-4 py-2 bg-slate-950 border-y border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(manualCode);
            }}
            className="flex items-center gap-2"
          >
            <input
              id="manual-barcode-input"
              type="text"
              placeholder="Or enter barcode number..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              id="btn-search-barcode"
              type="submit"
              disabled={!manualCode.trim()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find</span>
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-900">
          {/* If Item is Matched */}
          {matchedItem && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Part Found
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {matchedItem.sku}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white leading-snug">
                  {matchedItem.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Model: {matchedItem.deviceModel}
                </p>
                <p className="text-xs text-amber-400 font-medium">
                  Bin: {matchedItem.location}
                </p>
              </div>

              {/* Instant Stock Actions */}
              <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-300">Stock:</span>
                  <span className="font-mono font-black text-base text-white">
                    {matchedItem.quantity}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="scanner-deduct-btn"
                    type="button"
                    disabled={matchedItem.quantity <= 0}
                    onClick={() => {
                      playClickBeep();
                      onDeductItem(matchedItem);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-amber-600 disabled:opacity-30 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Use 1</span>
                  </button>

                  <button
                    id="scanner-restock-btn"
                    type="button"
                    onClick={() => {
                      playClickBeep();
                      onRestockItem(matchedItem);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add 1</span>
                  </button>

                  <button
                    id="scanner-print-btn"
                    type="button"
                    onClick={() => {
                      onClose();
                      onPrintItem(matchedItem);
                    }}
                    className="p-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg"
                    title="Print Label"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If Barcode Unrecognized */}
          {unrecognizedCode && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/50 space-y-2 text-center">
              <p className="text-xs text-amber-300">
                Barcode <strong className="font-mono text-white">"{unrecognizedCode}"</strong> not in inventory.
              </p>
              <button
                id="btn-add-scanned-new"
                type="button"
                onClick={() => {
                  onClose();
                  onAddNewWithBarcode(unrecognizedCode);
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add as New Part with this Barcode</span>
              </button>
            </div>
          )}

          {!matchedItem && !unrecognizedCode && (
            <p className="text-center text-xs text-slate-500 py-4">
              Scan or enter a barcode to view and update stock instantly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
