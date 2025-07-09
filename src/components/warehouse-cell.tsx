"use client";

import React from 'react';
import { useWarehouse } from '@/contexts/warehouse-context';
import { cn } from '@/lib/utils';
import { Cell, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Package } from 'lucide-react';

interface WarehouseCellProps {
  cell: Cell;
}

export function WarehouseCell({ cell }: WarehouseCellProps) {
  const {
    selectCell,
    selectedCell,
    getProductById,
    warehouse,
    suggestedCellId,
    movingProduct,
    executeMove,
  } = useWarehouse();
  
  const product = getProductById(cell.productId);

  const getFillPercentage = (product: Product | undefined) => {
    if (!product || !warehouse) return 0;
    return product.volume / warehouse.cellCapacity;
  };

  const getBackgroundColor = (fillPercentage: number) => {
    if (fillPercentage === 0) {
      // Slightly desaturated green for empty
      return 'hsl(120, 30%, 85%)';
    }
    // Interpolate from green (120) to red (0)
    const hue = 120 - 120 * fillPercentage;
    // Interpolate lightness from light (70) to darker (50)
    const lightness = 70 - 20 * fillPercentage;
    return `hsl(${hue}, 60%, ${lightness}%)`;
  };

  const fillPercentage = getFillPercentage(product);
  const bgColor = getBackgroundColor(fillPercentage);
  
  const isSelected = selectedCell?.id === cell.id;
  const isSuggested = suggestedCellId === cell.id;
  const isMoveTarget = movingProduct?.possibleTargets.includes(cell.id) ?? false;

  const handleClick = () => {
    if (isMoveTarget) {
      executeMove(cell);
    } else {
      selectCell(cell);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="relative w-full aspect-square"
            onClick={handleClick}
          >
            <div
              className={cn(
                "w-full h-full rounded-sm flex items-center justify-center cursor-pointer transition-all duration-200",
                "hover:ring-2 hover:ring-offset-2 hover:ring-accent hover:z-10",
                isSelected && "ring-2 ring-offset-2 ring-primary z-10 scale-105",
                isSuggested && "ring-2 ring-offset-2 ring-amber-400 z-10 scale-105 animation-flash",
                isMoveTarget && "ring-2 ring-offset-2 ring-green-500 z-10 animation-flash",
                !isMoveTarget && movingProduct && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: isMoveTarget ? 'hsl(120, 40%, 90%)' : bgColor }}
            >
              {product && <Package className="h-4 w-4 md:h-5 md:h-5 text-black/50" />}
               <div
                className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/10 opacity-50"
                style={{ transform: `scaleY(${fillPercentage})`, transformOrigin: 'bottom' }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">Cell: L{cell.level + 1}-R{cell.row + 1}-C{cell.column + 1}</p>
            {product ? (
              <>
                <p>Product: {product.name}</p>
                <p>Volume: {product.volume} / {warehouse?.cellCapacity}</p>
              </>
            ) : (
              <p>Empty</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
