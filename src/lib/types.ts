export interface Product {
  id: string;
  name: string;
  volume: number; // in cubic units
  popularityScore: number;
}

export interface Cell {
  id: string; // "level-row-col"
  level: number;
  row: number;
  column: number;
  productId: string | null;
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

export type PopularityFormula = (product: Product) => number;
