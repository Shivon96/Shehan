import React, { useState, useEffect } from 'react';
import { X, Wand2 } from 'lucide-react';
import { InventoryItem, PartCategory } from '../types';

interface SimpleAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  initialItem?: InventoryItem | null;
  initialBarcode?: string;
}

const CATEGORIES: PartCategory[] = [
  'Screen & Displays',
  'Batteries',
  'Charging Ports & Flex',
  'Micro-soldering ICs',
  'Passives & SMD Components',
  'Game Console Parts',
  'Laptop & Board Parts',
  'Tools & Supplies',
];

export const SimpleAddEditModal: React.FC<SimpleAddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  initialBarcode = '',
}) => {
  const [name, setName] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [category, setCategory] = useState<PartCategory>('Screen & Displays');
  const [location, setLocation] = useState('Bin A-01');
  const [quantity, setQuantity] = useState(5);
  const [minQuantity, setMinQuantity] = useState(2);
  const [sellingPrice, setSellingPrice] = useState(35);
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setDeviceModel(initialItem.deviceModel);
      setCategory(initialItem.category);
      setLocation(initialItem.location);
      setQuantity(initialItem.quantity);
      setMinQuantity(initialItem.minQuantity);
      setSellingPrice(initialItem.sellingPrice);
      setBarcode(initialItem.barcode);
    } else {
      setName('');
      setDeviceModel('');
      setCategory('Screen & Displays');
      setLocation('Bin A-01');
      setQuantity(5);
      setMinQuantity(2);
      setSellingPrice(35);
      // Generate initial barcode or use passed-in initial barcode
      if (initialBarcode) {
        setBarcode(initialBarcode);
      } else {
        generateRandomBarcode();
      }
    }
  }, [initialItem, initialBarcode, isOpen]);

  const generateRandomBarcode = () => {
    const code = '8901' + Math.floor(10000000 + Math.random() * 90000000).toString();
    setBarcode(code);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const itemToSave: InventoryItem = {
      id: initialItem ? initialItem.id : `part-${Date.now()}`,
      sku: initialItem ? initialItem.sku : `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      deviceModel: deviceModel.trim() || 'Universal',
      category,
      location: location.trim() || 'General Bin',
      condition: initialItem?.condition || 'Brand New OEM',
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 1,
      costPrice: initialItem?.costPrice || Math.round(Number(sellingPrice) * 0.4),
      sellingPrice: Number(sellingPrice) || 0,
      supplier: initialItem?.supplier || 'Default Supplier',
      unit: 'pcs',
      barcode: barcode.trim() || `8901${Date.now().toString().slice(-8)}`,
      lastUpdated: new Date().toISOString(),
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div
      id="add-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
    >
      <div
        id="add-edit-card"
        className="w-full max-w-md bg-slate-900 border border-slate-700 text-slate-100 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
          <h2 className="font-bold text-sm text-white">
            {initialItem ? 'Edit Part Details' : 'Add New Repair Part'}
          </h2>
          <button
            id="btn-close-add-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Part Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Part Name *
            </label>
            <input
              id="input-part-name"
              type="text"
              required
              placeholder="e.g. iPhone 13 OLED Display Screen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Compatible Device / Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Compatible Device / Model
            </label>
            <input
              id="input-device-model"
              type="text"
              placeholder="e.g. iPhone 13 (A2482) or Universal"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category & Bin Location */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                id="select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PartCategory)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bin / Shelf Location
              </label>
              <input
                id="input-location"
                type="text"
                placeholder="e.g. Bin A-03"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Quantity, Alert Level & Selling Price */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                In Stock
              </label>
              <input
                id="input-quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alert Below
              </label>
              <input
                id="input-min-quantity"
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Price ($)
              </label>
              <input
                id="input-selling-price"
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Barcode Number & Auto-generate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Barcode Number (Code 128 / UPC)
              </label>
              <button
                type="button"
                onClick={generateRandomBarcode}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <Wand2 className="w-3 h-3" /> Auto-Generate
              </button>
            </div>
            <input
              id="input-barcode"
              type="text"
              required
              placeholder="e.g. 890123456789"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-save-part"
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              {initialItem ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
