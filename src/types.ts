export type PartCategory =
  | 'Screen & Displays'
  | 'Batteries'
  | 'Charging Ports & Flex'
  | 'Micro-soldering ICs'
  | 'Passives & SMD Components'
  | 'Game Console Parts'
  | 'Laptop & Board Parts'
  | 'Cameras & Sensors'
  | 'Housings & Glass'
  | 'Tools & Supplies';

export type PartCondition =
  | 'Brand New OEM'
  | 'Premium Aftermarket'
  | 'Refurbished OEM'
  | 'Tested Working Pull';

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: PartCategory;
  deviceModel: string;
  location: string; // e.g. "Rack A / Shelf 3 / Bin 12" or "SMD Drawer 04"
  condition: PartCondition;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  unit: string; // 'pcs', 'reel', 'pack', 'set'
  notes?: string;
  lastUpdated: string;
}

export type TransactionType = 'in' | 'out' | 'audit';

export type TransactionReason =
  | 'Repair Job'
  | 'Customer Purchase'
  | 'Supplier Restock'
  | 'Damaged / Defective'
  | 'Inventory Audit'
  | 'Location Transfer';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  type: TransactionType;
  delta: number;
  quantityAfter: number;
  reason: TransactionReason;
  ticketRef?: string; // e.g. "JOB-2084"
  technician?: string; // e.g. "Alex T."
  notes?: string;
  timestamp: string;
}

export type LabelSizeFormat =
  | '50x30' // Standard part label (50mm x 30mm / 2" x 1.2")
  | '40x25' // Small SMD / Bin label (40mm x 25mm / 1.5" x 1")
  | '60x40' // Large shelf / box label (60mm x 40mm / 2.4" x 1.6")
  | 'avery-sheet'; // Standard Letter/A4 30-per-sheet (1" x 2-5/8")

export interface LabelSettings {
  format: LabelSizeFormat;
  showPrice: boolean;
  showLocation: boolean;
  showModel: boolean;
  showShopName: boolean;
  shopName: string;
  showCondition: boolean;
  showDate: boolean;
  copiesPerItem: number;
}
