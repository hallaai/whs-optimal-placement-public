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
  distanceZone1: number;
  distanceZone2: number;
  distanceZone3: number;
}

export interface MoveTarget {
  id: string;
  zone: 1 | 2 | 3 | 0; // 0 means not a target
}
