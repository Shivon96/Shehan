import React from 'react';
import { MapPin, Minus, Plus, Printer, Edit2, Trash2, Smartphone, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../types';
import { playClickBeep } from '../utils/audio';

interface SimplePartCardProps {
  item: InventoryItem;
  onDeduct: () => void;
  onRestock: () => void;
  onPrint: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SimplePartCard: React.FC<SimplePartCardProps> = ({
  item,
  onDeduct,
  onRestock,
  onPrint,
  onEdit,
  onDelete,
}) => {
  const isOutOfStock = item.quantity === 0;
  const isLowStock = item.quantity <= item.minQuantity && item.quantity > 0;

  return (
    <div
      id={`part-card-${item.id}`}
      className={`p-4 rounded-xl border transition-all ${
        isOutOfStock
          ? 'bg-rose-950/20 border-rose-800/60'
          : isLowStock
          ? 'bg-amber-950/20 border-amber-800/60'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      {/* Top Row: SKU, Category & Stock Status */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-[11px]">
            {item.sku}
          </span>
          <span className="text-slate-400 text-xs truncate max-w-[120px]">
            {item.category}
          </span>
        </div>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Low Stock ({item.quantity})
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            {item.quantity} in stock
          </span>
        )}
      </div>

      {/* Part Name */}
      <h3 className="text-sm font-bold text-white leading-snug">
        {item.name}
      </h3>

      {/* Device Model & Location */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-300">{item.deviceModel}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-medium">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{item.location}</span>
        </div>
      </div>

      {/* Price & Barcode */}
      <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
        <span className="text-emerald-400 font-bold font-mono text-sm">
          ${item.sellingPrice.toFixed(2)}
        </span>
        <span className="text-slate-400 font-mono text-[11px]">
          Code: {item.barcode}
        </span>
      </div>

      {/* Bottom Action Controls: Simple Stepper & Buttons */}
      <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/60">
        {/* Instant Stock Stepper */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <button
            id={`btn-deduct-${item.id}`}
            type="button"
            disabled={item.quantity <= 0}
            onClick={() => {
              playClickBeep();
              onDeduct();
            }}
            title="Use 1 (Deduct)"
            className="w-8 h-8 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-amber-600 text-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-base transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="px-3 text-center min-w-[40px]">
            <span className={`font-mono font-bold text-sm ${
              isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-white'
            }`}>
              {item.quantity}
            </span>
          </div>

          <button
            id={`btn-add-${item.id}`}
            type="button"
            onClick={() => {
              playClickBeep();
              onRestock();
            }}
            title="Add 1 (Restock)"
            className="w-8 h-8 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 text-slate-200 flex items-center justify-center font-bold text-base transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons: Print, Edit, Delete */}
        <div className="flex items-center gap-1.5">
          <button
            id={`btn-print-${item.id}`}
            type="button"
            onClick={onPrint}
            title="Print Barcode Label"
            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Label</span>
          </button>

          <button
            id={`btn-edit-${item.id}`}
            type="button"
            onClick={onEdit}
            title="Edit Part Details"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            id={`btn-delete-${item.id}`}
            type="button"
            onClick={() => {
              if (confirm(`Delete "${item.name}" from inventory?`)) {
                onDelete();
              }
            }}
            title="Delete Part"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
