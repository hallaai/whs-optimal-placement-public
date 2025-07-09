"use client"

import React, { useState } from 'react';
import { useWarehouse } from '@/contexts/warehouse-context';
import { WarehouseCell } from './warehouse-cell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Truck } from 'lucide-react';
import { Cell } from '@/lib/types';

export function WarehouseMap() {
  const { warehouse } = useWarehouse();
  const [activeLevel, setActiveLevel] = useState("level-0");

  if (!warehouse) {
    return (
      <div className="p-4 md:p-8 flex-1">
        <div className="flex items-center mb-4">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-12 gap-1 md:gap-2">
          {Array.from({ length: 96 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-sm" />
          ))}
        </div>
      </div>
    );
  }
  
  const getCellsForLevel = (level: number) => {
    return warehouse.cells
      .filter(cell => cell.level === level)
      // Sort by row descending to place R1 at the bottom, then by column ascending
      .sort((a, b) => {
        if (a.row > b.row) return -1;
        if (a.row < b.row) return 1;
        return a.column - b.column;
      });
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
       <Tabs value={activeLevel} onValueChange={setActiveLevel} className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary"/>
            Warehouse Layout
          </h2>
          <TabsList>
            {Array.from({ length: warehouse.levels }).map((_, i) => (
              <TabsTrigger key={i} value={`level-${i}`}>Level {i + 1}</TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-4 rounded-lg border flex flex-col justify-between">
          {Array.from({ length: warehouse.levels }).map((_, i) => (
            <TabsContent key={i} value={`level-${i}`} className="mt-0 h-full">
              <div 
                className="grid gap-1.5 md:gap-2 h-full"
                style={{ gridTemplateColumns: `repeat(${warehouse.columns}, minmax(0, 1fr))` }}
              >
                {getCellsForLevel(i).map(cell => <WarehouseCell key={cell.id} cell={cell} />)}
              </div>
            </TabsContent>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-muted-foreground text-center mb-2">LOADING GATES</h3>
          <div className="flex justify-around items-center bg-gray-200 dark:bg-gray-800 p-2 rounded-md">
            {Array.from({length: Math.min(warehouse.columns, 6)}).map((_, i) => (
              <div key={`gate-${i}`} className="flex flex-col items-center gap-1 text-muted-foreground">
                <Truck className="h-6 w-6"/>
                <span className="text-xs font-mono">Gate {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
