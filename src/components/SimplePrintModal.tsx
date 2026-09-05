import React, { useState } from 'react';
import { X, Printer, Minus, Plus } from 'lucide-react';
import { InventoryItem } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface SimplePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const SimplePrintModal: React.FC<SimplePrintModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [copies, setCopies] = useState(1);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* On-screen Modal Dialog (hidden during actual browser printing) */}
      <div
        id="simple-print-modal-backdrop"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 no-print overflow-y-auto"
      >
        <div
          id="simple-print-card"
          className="w-full max-w-md bg-slate-900 border border-slate-700 text-slate-100 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-sm text-white">Print Part Label</h2>
            </div>
            <button
              id="btn-close-print-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Label Preview Card */}
          <div className="p-4 bg-slate-950 flex flex-col items-center justify-center">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">
              Label Preview (Ready for Thermal / Paper Printer)
            </p>

            {/* Label Visual */}
            <div className="w-full max-w-[320px] bg-white text-slate-950 p-3.5 rounded-lg border-2 border-slate-300 shadow-md flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 border-b border-slate-200 pb-1 mb-1">
                <span>ELECTRONICS REPAIR LAB</span>
                <span className="font-mono">{item.sku}</span>
              </div>

              <h4 className="font-extrabold text-xs text-slate-950 line-clamp-2 mt-0.5 leading-tight">
                {item.name}
              </h4>

              <p className="text-[11px] text-slate-600 font-medium truncate w-full mt-0.5">
                {item.deviceModel}
              </p>

              {/* Scannable Barcode */}
              <div className="my-1.5 w-full flex justify-center">
                <BarcodeRenderer
                  value={item.barcode || item.sku}
                  width={1.6}
                  height={42}
                  fontSize={11}
                  margin={1}
                />
              </div>

              {/* Location & Price */}
              <div className="w-full flex items-center justify-between text-[11px] font-bold pt-1 border-t border-slate-200">
                <span className="text-slate-800 font-mono">
                  📍 {item.location}
                </span>
                <span className="text-emerald-700 font-mono text-xs">
                  ${item.sellingPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Copies & Print Button */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">
                Number of Copies:
              </span>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  disabled={copies <= 1}
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs text-white">
                  {copies}
                </span>
                <button
                  type="button"
                  onClick={() => setCopies((c) => c + 1)}
                  className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              id="btn-execute-print"
              type="button"
              onClick={handlePrint}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print {copies} Label{copies > 1 ? 's' : ''} Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target element for @media print */}
      <div id="printable-labels-area" className="hidden print:block">
        {Array.from({ length: copies }).map((_, idx) => (
          <div
            key={idx}
            className="w-[50mm] h-[30mm] p-2 m-1 border border-black flex flex-col justify-between items-center text-center bg-white text-black page-break-inside-avoid"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            <div className="w-full flex justify-between text-[7pt] font-bold border-b border-black pb-0.5">
              <span>REPAIR SHOP</span>
              <span className="font-mono">{item.sku}</span>
            </div>

            <div className="text-[8pt] font-bold leading-tight line-clamp-1 w-full mt-0.5">
              {item.name}
            </div>
            <div className="text-[7pt] text-gray-700 truncate w-full">
              {item.deviceModel}
            </div>

            <div className="my-0.5 flex justify-center">
              <BarcodeRenderer
                value={item.barcode || item.sku}
                width={1.2}
                height={26}
                fontSize={9}
                margin={0}
              />
            </div>

            <div className="w-full flex justify-between text-[7pt] font-bold border-t border-black pt-0.5">
              <span>{item.location}</span>
              <span>${item.sellingPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
