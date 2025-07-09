
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Cell, WarehouseLayout, AppSettings, MoveTarget } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getWarehouseData } from '@/lib/data';

// --- Context Definition ---
interface WarehouseContextType {
  warehouse: WarehouseLayout | null;
  cells: Cell[];
  products: Product[];
  settings: AppSettings;
  selectedCell: Cell | null;
  suggestedCellId: string | null;
  movingProduct: { fromCell: Cell, possibleTargets: MoveTarget[], perfectTargetId: string | null } | null;
  loading: boolean;
  error: Error | null;
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
  const [settings, setSettings] = useState<AppSettings>({
    chainLength: 3,
    distanceZone1: 2,
    distanceZone2: 4,
    distanceZone3: 6,
  });
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [suggestedCellId, setSuggestedCellId] = useState<string | null>(null);
  const [movingProduct, setMovingProduct] = useState<{ fromCell: Cell, possibleTargets: MoveTarget[], perfectTargetId: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getWarehouseData();
        const initialWarehouse = {
            ...data.warehouseLayout,
            cells: data.cells,
        };

        const populatedCells = [...initialWarehouse.cells];
        data.products.forEach(p => {
          const cell = populatedCells.find(c => c.productIds.includes(p.id));
          if(cell) {
              cell.productId = p.id;
          }
        });
        
        initialWarehouse.cells = populatedCells;
        
        setWarehouse(initialWarehouse);
        setProducts(data.products);
      } catch (err) {
        setError(err as Error);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProductById = (id: string | null) => products.find(p => p.id === id);
  
  const getCellByProduct = (productId: string) => warehouse?.cells.find(c => c.productId === productId);

  const selectCell = (cell: Cell | null) => {
    if (movingProduct) return; // Don't change selection during a move
    setSelectedCell(cell);
    setSuggestedCellId(null);
  };
  
  const findOptimalPlacement = (product: Product): Cell | null => {
    if (!warehouse) return null;
    const productVolume = product.volume;

    // Prioritize ground floor (level 0) and front rows (lower row index)
    // This simulates proximity to loading gates at the front (row 0)
    return warehouse.cells
      .slice() // Create a copy to avoid mutating the original array
      .sort((a,b) => {
        // Base score: lower is better
        let scoreA = (a.level * 2) + a.row + (a.column / warehouse.columns);
        let scoreB = (b.level * 2) + b.row + (b.column / warehouse.columns);
        
        // Volume Penalty: Higher volume products get a bonus for being in optimal spots
        // We subtract this, so a larger volume results in a lower (better) score
        const volumeBonus = (productVolume / warehouse.cellCapacity); 
        scoreA -= volumeBonus * (warehouse.levels - a.level);
        scoreB -= volumeBonus * (warehouse.levels - b.level);
        
        // Emptiness Priority: Empty cells are vastly preferable.
        if (a.productId === null && b.productId !== null) return -1;
        if (a.productId !== null && b.productId === null) return 1;

        return scoreA - scoreB;
      })[0] || null;
  };

  const addProduct = (name: string, volume: number) => {
    const newProduct: Product = { id: uuidv4(), name, volume, popularityScore: Math.round(Math.random() * 100), description: `Volume: ${volume}` };
    setProducts(prev => [...prev, newProduct]);
    const placement = findOptimalPlacement(newProduct);
    if(placement && !placement.productId) { // Only place if the optimal spot is empty
      setWarehouse(prev => {
        if (!prev) return null;
        const newCells = prev.cells.map(c => {
            if (c.id === placement.id) return { ...c, productId: newProduct.id };
            return c;
        });
        return { ...prev, cells: newCells };
      });
      setSuggestedCellId(placement.id);
      setSelectedCell({ ...placement, productId: newProduct.id });
    } else if (placement) { // If optimal spot is taken, just suggest it
      setSuggestedCellId(placement.id);
      setSelectedCell(null); // Don't select anything as no action was taken
    }
  };

  const startMove = (fromCell: Cell) => {
    if (!warehouse || !fromCell.productId) return;
    const productToMove = getProductById(fromCell.productId);
    if (!productToMove) return;

    // This is the "perfect" spot, regardless of if it's occupied.
    const perfectTargetCell = findOptimalPlacement(productToMove);

    const emptyCells = warehouse.cells.filter(c => c.productId === null);

    const calculateDistance = (cellA: Cell, cellB: Cell) => {
        return Math.sqrt(
            Math.pow(cellA.column - cellB.column, 2) +
            Math.pow(cellA.row - cellB.row, 2) +
            Math.pow(cellA.level - cellB.level, 2)
        );
    };

    const targets: MoveTarget[] = perfectTargetCell ? emptyCells.map(cell => {
      const distance = calculateDistance(cell, perfectTargetCell);
      let zone: MoveTarget['zone'] = 0;
      if (distance <= settings.distanceZone1) zone = 1;
      else if (distance <= settings.distanceZone2) zone = 2;
      else if (distance <= settings.distanceZone3) zone = 3;
      
      return { id: cell.id, zone };
    }).filter(t => t.zone > 0) : [];

    setMovingProduct({ 
      fromCell, 
      possibleTargets: targets,
      perfectTargetId: perfectTargetCell?.id || null 
    });
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
    setWarehouse(prev => {
      if (!prev) return null;
      const newCells = prev.cells.map(c => {
          if (c.id === fromCell.id) return { ...c, productId: null };
          if (c.id === toCell.id) return { ...c, productId: fromCell.productId };
          return c;
      });
      return { ...prev, cells: newCells };
    });

    setMovingProduct(null);
    setSelectedCell({...toCell, productId: fromCell.productId});
  };

  const value = {
    warehouse,
    cells: warehouse?.cells ?? [],
    products,
    settings,
    selectedCell,
    suggestedCellId,
    movingProduct,
    loading,
    error,
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
