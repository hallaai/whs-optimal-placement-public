export interface Product {
  id: string;
  name: string;
  description: string;
  volume: number;
  popularityScore: number;
}

export interface Cell {
  id: string;
  name: string;
  level: number;
  row: number;
  column: number;
  productId: string | null;
  productIds: string[]; // Keep this to know all products initially in the cell
}

export interface WarehouseLayout {
  levels: number;
  rows: number;
  columns: number;
  cells: Cell[];
  cellCapacity: number; // max volume per cell
}

export interface AppSettings {
  chainLength: number;
}
