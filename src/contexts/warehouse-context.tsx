
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Cell, WarehouseLayout, AppSettings } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getWarehouseData } from '@/lib/data';

// Helper function to find optimal placement (can be improved)

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
  cells: Cell[];
  products: Product[];
  settings: AppSettings;
  selectedCell: Cell | null;
  suggestedCellId: string | null;
  movingProduct: { fromCell: Cell, possibleTargets: string[] } | null;
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
  const [settings, setSettings] = useState<AppSettings>({ chainLength: 3 });
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [suggestedCellId, setSuggestedCellId] = useState<string | null>(null);
  const [movingProduct, setMovingProduct] = useState<{ fromCell: Cell, possibleTargets: string[] } | null>(null);
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
  
  const findOptimalPlacement = (productVolume: number): Cell | null => {
    if (!warehouse) return null;
    // Simple algorithm: find the first empty cell on the lowest level, closest to the front.
    return warehouse.cells
      .filter(c => c.productId === null)
      .sort((a,b) => a.level - b.level || a.row - b.row || a.column - b.column)[0] || null;
  };

  const addProduct = (name: string, volume: number) => {
    const newProduct: Product = { id: uuidv4(), name, volume, popularityScore: Math.round(Math.random() * 100), description: `Volume: ${volume}` };
    setProducts(prev => [...prev, newProduct]);
    const placement = findOptimalPlacement(volume);
    if(placement) {
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
    }
  };

  const startMove = (fromCell: Cell) => {
    if (!warehouse || !fromCell.productId) return;
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

