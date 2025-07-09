"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Cell, WarehouseLayout, AppSettings } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// --- Helper Functions ---
const createInitialWarehouse = (): WarehouseLayout => {
  const levels = 3, rows = 8, columns = 12, cellCapacity = 100;
  const cells: Cell[] = [];
  for (let l = 0; l < levels; l++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        cells.push({ id: `${l}-${r}-${c}`, level: l, row: r, column: c, productId: null });
      }
    }
  }
  return { levels, rows, columns, cells, cellCapacity };
};

const createInitialProducts = (): Product[] => {
  return [
    { id: 'prod-1', name: 'Heavy Machinery', volume: 85, popularityScore: 90 },
    { id: 'prod-2', name: 'Electronics', volume: 40, popularityScore: 75 },
    { id: 'prod-3', name: 'Bulk Grain', volume: 95, popularityScore: 50 },
    { id: 'prod-4', name: 'Textiles', volume: 60, popularityScore: 65 },
    { id: 'prod-5', name: 'Spare Parts', volume: 25, popularityScore: 88 },
  ];
};

const populateInitialWarehouse = (warehouse: WarehouseLayout, products: Product[]): [WarehouseLayout, Product[]] => {
  const newWarehouse = { ...warehouse, cells: [...warehouse.cells] };
  const sortedProducts = [...products].sort((a, b) => b.popularityScore - a.popularityScore);

  let productIndex = 0;
  for (let i = 0; i < newWarehouse.cells.length; i++) {
    if (productIndex < sortedProducts.length) {
      const cell = newWarehouse.cells[i];
      if (cell.productId === null) {
        cell.productId = sortedProducts[productIndex].id;
        productIndex++;
      }
    } else {
      break;
    }
  }
  return [newWarehouse, products];
};

// --- Context Definition ---
interface WarehouseContextType {
  warehouse: WarehouseLayout | null;
  products: Product[];
  settings: AppSettings;
  selectedCell: Cell | null;
  suggestedCellId: string | null;
  movingProduct: { fromCell: Cell, possibleTargets: string[] } | null;
  setSettings: (settings: AppSettings) => void;
  selectCell: (cell: Cell | null) => void;
  addProduct: (name: string, volume: number) => void;
  startMove: (fromCell: Cell) => void;
  executeMove: (toCell: Cell) => void;
  cancelMove: () => void;
  getProductById: (id: string | null) => Product | undefined;
  getCellByProduct: (productId: string) => Cell | undefined;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [warehouse, setWarehouse] = useState<WarehouseLayout | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ chainLength: 3 });
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [suggestedCellId, setSuggestedCellId] = useState<string | null>(null);
  const [movingProduct, setMovingProduct] = useState<{ fromCell: Cell, possibleTargets: string[] } | null>(null);


  useEffect(() => {
    const initialWarehouse = createInitialWarehouse();
    const initialProducts = createInitialProducts();
    const [populatedWarehouse, populatedProducts] = populateInitialWarehouse(initialWarehouse, initialProducts);
    setWarehouse(populatedWarehouse);
    setProducts(populatedProducts);
  }, []);

  const getProductById = (id: string | null) => products.find(p => p.id === id);
  
  const getCellByProduct = (productId: string) => warehouse?.cells.find(c => c.productId === productId);

  const selectCell = (cell: Cell | null) => {
    if (movingProduct) return; // Don't change selection during a move
    setSelectedCell(cell);
    setSuggestedCellId(null);
  };
  
  const findOptimalPlacement = (productVolume: number): Cell | null => {
    if (!warehouse) return null;
    // Simple algorithm: find the first empty cell on the lowest level, closest to the front.
    return warehouse.cells.find(c => c.productId === null) || null;
  };

  const addProduct = (name: string, volume: number) => {
    const newProduct: Product = { id: uuidv4(), name, volume, popularityScore: Math.round(Math.random() * 100) };
    setProducts(prev => [...prev, newProduct]);
    const placement = findOptimalPlacement(volume);
    if(placement) {
      setSuggestedCellId(placement.id);
      setSelectedCell(placement);
      // In a real scenario, you'd wait for user confirmation before placing
      // For now, we just suggest.
    }
  };

  const startMove = (fromCell: Cell) => {
    if (!warehouse) return;
    const emptyCells = warehouse.cells.filter(c => c.productId === null).map(c => c.id);
    setMovingProduct({ fromCell, possibleTargets: emptyCells });
    setSelectedCell(null);
  };

  const cancelMove = () => {
    setMovingProduct(null);
    setSelectedCell(null);
  };

  const executeMove = (toCell: Cell) => {
    if (!movingProduct || !warehouse) return;
    const { fromCell } = movingProduct;
    
    // Simple 1-to-1 move
    if (settings.chainLength === 1) {
       setWarehouse(prev => {
        if (!prev) return null;
        const newCells = prev.cells.map(c => {
            if (c.id === fromCell.id) return { ...c, productId: null };
            if (c.id === toCell.id) return { ...c, productId: fromCell.productId };
            return c;
        });
        return { ...prev, cells: newCells };
      });
    } else {
      // Chain shifting logic
      const cellsToUpdate: { from: Cell, to: Cell }[] = [];
      let currentCell = fromCell;
      let targetCell = toCell;

      const path = findPath(fromCell, toCell, warehouse);
      if(!path || path.length < 2) {
         // Fallback to simple move if path is trivial
         return executeMove({ ...toCell, id: fromCell.id === toCell.id ? '' : toCell.id });
      }

      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i+1];
        if (to.productId === null) {
          cellsToUpdate.push({from: from, to: to});
          break;
        }
        cellsToUpdate.push({from: from, to: to});
      }

      setWarehouse(prev => {
        if (!prev) return null;
        const newCells = [...prev.cells];
        const productIdsToShift = cellsToUpdate.map(update => {
            const cell = newCells.find(c => c.id === update.from.id);
            return cell?.productId;
        });

        for(let i=0; i<cellsToUpdate.length; i++) {
            const toCellIndex = newCells.findIndex(c => c.id === cellsToUpdate[i].to.id);
            if(toCellIndex !== -1) {
                newCells[toCellIndex].productId = productIdsToShift[i]!;
            }
        }
        const firstCellIndex = newCells.findIndex(c => c.id === cellsToUpdate[0].from.id);
        if(firstCellIndex !== -1) newCells[firstCellIndex].productId = null;
        
        return { ...prev, cells: newCells };
      });
    }

    setMovingProduct(null);
    setSelectedCell(toCell);
  };
  
  // A* pathfinding would be ideal here, but for simplicity, we use a basic grid walk.
  const findPath = (start: Cell, end: Cell, warehouse: WarehouseLayout): Cell[] | null => {
      // For this demo, we'll simulate a simple straight-line or L-shape path logic.
      const path: Cell[] = [];
      let current = start;
      while(current.id !== end.id) {
          path.push(current);
          const { level, row, column } = current;
          const dr = Math.sign(end.row - row);
          const dc = Math.sign(end.column - column);
          
          let nextRow = row;
          let nextCol = column;

          if (dr !== 0) nextRow += dr;
          else if (dc !== 0) nextCol += dc;
          
          const nextCell = warehouse.cells.find(c => c.level === level && c.row === nextRow && c.column === nextCol);
          if(!nextCell || path.find(p => p.id === nextCell.id)) return null; // Path blocked or cycle
          
          current = nextCell;

          if (path.length > warehouse.cells.length) return null; // Safety break
      }
      path.push(end);
      return path;
  };


  const value = {
    warehouse,
    products,
    settings,
    selectedCell,
    suggestedCellId,
    movingProduct,
    setSettings,
    selectCell,
    addProduct,
    startMove,
    executeMove,
    cancelMove,
    getProductById,
    getCellByProduct,
  };

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

// Simple UUID v4 generator
function v4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
