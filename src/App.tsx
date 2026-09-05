/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from './types';
import { INITIAL_PARTS } from './data/initialData';
import { SimpleHeader } from './components/SimpleHeader';
import { SimplePartCard } from './components/SimplePartCard';
import { SimpleScannerModal } from './components/SimpleScannerModal';
import { SimplePrintModal } from './components/SimplePrintModal';
import { SimpleAddEditModal } from './components/SimpleAddEditModal';
import { playSuccessBeep } from './utils/audio';
import { PackageOpen, Plus, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'cs_repair_inventory_simple_v2';

export default function App() {
  // Load saved inventory from localStorage or default initial parts
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_PARTS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }, [items]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Modals State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [scannedBarcodeForNew, setScannedBarcodeForNew] = useState('');
  const [printingItem, setPrintingItem] = useState<InventoryItem | null>(null);

  // Low stock count
  const lowStockCount = useMemo(() => {
    return items.filter((item) => item.quantity <= item.minQuantity).length;
  }, [items]);

  // Filtered parts list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Low stock filter
      if (showOnlyLowStock && item.quantity > item.minQuantity) {
        return false;
      }
      // Search query (name, model, sku, barcode, or location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.deviceModel.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.barcode.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [items, showOnlyLowStock, searchQuery]);

  // Instant Deduct (-1)
  const handleDeduct = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.quantity > 0) {
          return {
            ...item,
            quantity: item.quantity - 1,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  // Instant Restock (+1)
  const handleRestock = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: item.quantity + 1,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  // Save Part (Add or Edit)
  const handleSavePart = (part: InventoryItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === part.id);
      if (exists) {
        return prev.map((i) => (i.id === part.id ? part : i));
      } else {
        return [part, ...prev];
      }
    });
    playSuccessBeep();
  };

  // Delete Part
  const handleDeletePart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Reset sample catalog
  const handleResetCatalog = () => {
    if (confirm('Reset inventory back to sample repair shop parts?')) {
      setItems(INITIAL_PARTS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div id="simple-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      {/* Mobile-friendly frame (fills phone screen or max 480px on desktop) */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col relative border-x border-slate-900 shadow-2xl">
        
        {/* Simple Header with Search, Scan & Add Buttons */}
        <SimpleHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showOnlyLowStock={showOnlyLowStock}
          onToggleLowStock={setShowOnlyLowStock}
          totalCount={items.length}
          lowStockCount={lowStockCount}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenAddPart={() => {
            setEditingItem(null);
            setScannedBarcodeForNew('');
            setIsAddEditOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 space-y-3 overflow-y-auto">
          {/* Active filter note */}
          {showOnlyLowStock && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
              <span>Showing low stock items only</span>
              <button
                type="button"
                onClick={() => setShowOnlyLowStock(false)}
                className="underline text-[11px] hover:text-white"
              >
                Show All
              </button>
            </div>
          )}

          {/* List of Parts */}
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 my-4 space-y-3">
              <PackageOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-sm text-white">No parts found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {searchQuery
                  ? `No parts match "${searchQuery}". Try another keyword or clear search.`
                  : 'No items currently in this view.'}
              </p>
              <button
                id="empty-add-btn"
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setScannedBarcodeForNew('');
                  setIsAddEditOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Part</span>
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <SimplePartCard
                key={item.id}
                item={item}
                onDeduct={() => handleDeduct(item.id)}
                onRestock={() => handleRestock(item.id)}
                onPrint={() => setPrintingItem(item)}
                onEdit={() => {
                  setEditingItem(item);
                  setIsAddEditOpen(true);
                }}
                onDelete={() => handleDeletePart(item.id)}
              />
            ))
          )}

          {/* Reset Demo Data Link */}
          <div className="pt-6 pb-8 text-center">
            <button
              type="button"
              onClick={handleResetCatalog}
              className="text-[11px] text-slate-500 hover:text-slate-400 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Sample Parts</span>
            </button>
          </div>
        </main>

        {/* Barcode Scanner Modal */}
        <SimpleScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          items={items}
          onDeductItem={(item) => handleDeduct(item.id)}
          onRestockItem={(item) => handleRestock(item.id)}
          onPrintItem={(item) => setPrintingItem(item)}
          onAddNewWithBarcode={(barcode) => {
            setScannedBarcodeForNew(barcode);
            setEditingItem(null);
            setIsAddEditOpen(true);
          }}
        />

        {/* Label Print Modal */}
        <SimplePrintModal
          isOpen={Boolean(printingItem)}
          onClose={() => setPrintingItem(null)}
          item={printingItem}
        />

        {/* Add / Edit Part Modal */}
        <SimpleAddEditModal
          isOpen={isAddEditOpen}
          onClose={() => {
            setIsAddEditOpen(false);
            setEditingItem(null);
            setScannedBarcodeForNew('');
          }}
          onSave={handleSavePart}
          initialItem={editingItem}
          initialBarcode={scannedBarcodeForNew}
        />

      </div>
    </div>
  );
}
