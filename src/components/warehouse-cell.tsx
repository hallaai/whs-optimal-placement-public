
"use client";

import React from 'react';
import { useWarehouse } from '@/contexts/warehouse-context';
import { cn } from '@/lib/utils';
import { Cell, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Package, Star } from 'lucide-react';

interface WarehouseCellProps {
  cell: Cell;
}

export function WarehouseCell({ cell }: WarehouseCellProps) {
  const {
    selectCell,
    selectedCell,
    getProductById,
    warehouse,
    perfectTargetId,
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
  
  const isPerfectTarget = perfectTargetId === cell.id;

  const moveTargetInfo = movingProduct?.possibleTargets.find(t => t.id === cell.id);
  const isMoveTarget = !!moveTargetInfo;
  const isMoveOrigin = movingProduct?.fromCell.id === cell.id;


  const handleClick = () => {
    if (isMoveTarget) {
      executeMove(cell);
    } else if (!movingProduct) {
      selectCell(cell);
    }
  };

  let ringClass = '';
  let bgClass = '';
  let animationClass = '';

  if (isMoveTarget) {
      animationClass = 'animation-flash';
      ringClass = 'ring-2 ring-offset-2 z-10';
      switch (moveTargetInfo.zone) {
          case 1: ringClass += ' ring-blue-500'; bgClass = 'bg-blue-100 dark:bg-blue-900/50'; break;
          case 2: ringClass += ' ring-orange-500'; bgClass = 'bg-orange-100 dark:bg-orange-900/50'; break;
          case 3: ringClass += ' ring-gray-500'; bgClass = 'bg-gray-200 dark:bg-gray-700/50'; break;
      }
  } else if (isMoveOrigin) {
      ringClass = "ring-2 ring-offset-2 ring-primary z-10 scale-105";
  } else if (isSelected && !movingProduct) {
      ringClass = "ring-2 ring-offset-2 ring-primary z-10 scale-105";
  } else if (isPerfectTarget && !product) {
      // Flash empty suggested cells for new products
      ringClass = "ring-2 ring-offset-2 ring-amber-400 z-10 scale-105";
      animationClass = 'animation-flash';
  }

  const canBeClicked = isMoveTarget || !movingProduct;
  const isDimmed = movingProduct && !isMoveTarget && !isMoveOrigin && !isPerfectTarget;

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
                "w-full h-full rounded-sm flex items-center justify-center transition-all duration-200",
                canBeClicked && "cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-accent hover:z-10",
                !canBeClicked && "cursor-not-allowed",
                isDimmed && "opacity-50",
                ringClass,
                bgClass,
                animationClass
              )}
              style={{ backgroundColor: !bgClass ? bgColor : undefined }}
            >
              {product && <Package className="h-4 w-4 md:h-5 md:h-5 text-black/50" />}
               <div
                className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/10 opacity-50"
                style={{ transform: `scaleY(${fillPercentage})`, transformOrigin: 'bottom' }}
              />
            </div>
            {isPerfectTarget && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <Star className="h-2/3 w-2/3 text-yellow-400/80 fill-yellow-300/50" strokeWidth={1.5} />
                </div>
            )}
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
            {isPerfectTarget && <p className="font-bold text-yellow-500">Optimal Location</p>}
            {moveTargetInfo && <p className="font-bold text-blue-600 dark:text-blue-400">Zone {moveTargetInfo.zone} Target</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
