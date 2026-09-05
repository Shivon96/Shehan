import React from 'react';
import { Search, ScanLine, Plus, AlertTriangle, X, Cpu } from 'lucide-react';

interface SimpleHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showOnlyLowStock: boolean;
  onToggleLowStock: (val: boolean) => void;
  totalCount: number;
  lowStockCount: number;
  onOpenScanner: () => void;
  onOpenAddPart: () => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  searchQuery,
  onSearchChange,
  showOnlyLowStock,
  onToggleLowStock,
  totalCount,
  lowStockCount,
  onOpenScanner,
  onOpenAddPart,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 space-y-3">
      {/* Top Branding & Main Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Repair Stock
            </h1>
            <p className="text-[11px] text-slate-400">
              {totalCount} parts in shop
            </p>
          </div>
        </div>

        {/* Action Buttons: Scan Barcode & Add Part */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-scanner"
            type="button"
            onClick={onOpenScanner}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan</span>
          </button>

          <button
            id="btn-open-add"
            type="button"
            onClick={onOpenAddPart}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          id="search-input"
          type="text"
          placeholder="Search name, model, bin, or barcode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {searchQuery && (
          <button
            id="btn-clear-search"
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs: All vs Low Stock */}
      <div className="flex items-center gap-2 text-xs">
        <button
          id="tab-all-parts"
          type="button"
          onClick={() => onToggleLowStock(false)}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            !showOnlyLowStock
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Parts ({totalCount})
        </button>

        <button
          id="tab-low-stock"
          type="button"
          onClick={() => onToggleLowStock(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
            showOnlyLowStock
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock ({lowStockCount})</span>
        </button>
      </div>
    </header>
  );
};
