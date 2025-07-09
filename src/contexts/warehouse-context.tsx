
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
  perfectTargetId: string | null;
  movingProduct: { fromCell: Cell, possibleTargets: MoveTarget[] } | null;
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
  const [perfectTargetId, setPerfectTargetId] = useState<string | null>(null);
  const [movingProduct, setMovingProduct] = useState<{ fromCell: Cell, possibleTargets: MoveTarget[] } | null>(null);
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
    setPerfectTargetId(null);
  };
  
  const findOptimalPlacement = (product: Product, constrainToRow?: number): Cell | null => {
    if (!warehouse) return null;
    
    // Start with all cells
    let availableCells = warehouse.cells.slice();
    
    // If a row is specified (for moving products), filter the cells for that row
    if(constrainToRow !== undefined) {
        availableCells = availableCells.filter(c => c.row === constrainToRow);
    }

    // This simulates proximity to loading gates at the front (row 0)
    return availableCells
      .sort((a,b) => {
        // Base score: lower is better. Prioritize level, then row, then column.
        let scoreA = (a.level * 100) + (a.row * 10) + a.column;
        let scoreB = (b.level * 100) + (b.row * 10) + b.column;

        // Bonus for higher volume products being closer to gates (lower row/level)
        // A higher volume gives a bigger bonus, making the score lower (better)
        const volumeFactor = (product.volume / warehouse.cellCapacity) * 10; // amplified factor
        scoreA -= ((warehouse.rows - a.row) * volumeFactor * 2); // Prioritize row heavily
        scoreA -= ((warehouse.levels - a.level) * volumeFactor); // Then level

        scoreB -= ((warehouse.rows - b.row) * volumeFactor * 2);
        scoreB -= ((warehouse.levels - b.level) * volumeFactor);

        // Heavy penalty for occupied cells to push them to the end of the sort
        if (a.productId !== null && a.productId !== product.id) scoreA += 10000;
        if (b.productId !== null && b.productId !== product.id) scoreB += 10000;

        return scoreA - scoreB;
      })[0] || null;
  };

  const addProduct = (name: string, volume: number) => {
    const newProduct: Product = { id: uuidv4(), name, volume, popularityScore: Math.round(Math.random() * 100), description: `Volume: ${volume}` };
    
    const placement = findOptimalPlacement(newProduct);
    
    if (placement) {
        setPerfectTargetId(placement.id);
        
        if (!placement.productId) {
            setProducts(prev => [...prev, newProduct]);
            setWarehouse(prev => {
                if (!prev) return null;
                const newCells = prev.cells.map(c => {
                    if (c.id === placement.id) return { ...c, productId: newProduct.id };
                    return c;
                });
                return { ...prev, cells: newCells };
            });
            setSelectedCell({ ...placement, productId: newProduct.id });
        } else {
            setProducts(prev => [...prev, newProduct]);
            setSelectedCell(null);
        }
    }
  };

  const startMove = (fromCell: Cell) => {
    if (!warehouse || !fromCell.productId) return;
    const productToMove = getProductById(fromCell.productId);
    if (!productToMove) return;

    const perfectTargetCell = findOptimalPlacement(productToMove, fromCell.row);
    setPerfectTargetId(perfectTargetCell?.id || null);

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
    });
    setSelectedCell(null);
    setSuggestedCellId(null);
  };

  const cancelMove = () => {
    setMovingProduct(null);
    setSelectedCell(null);
    setPerfectTargetId(null);
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
    setPerfectTargetId(null);
    setSelectedCell({...toCell, productId: fromCell.productId});
  };

  const value = {
    warehouse,
    cells: warehouse?.cells ?? [],
    products,
    settings,
    selectedCell,
    suggestedCellId,
    perfectTargetId,
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
