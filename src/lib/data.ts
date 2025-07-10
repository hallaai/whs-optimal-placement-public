'use server';

import { Cell, Product } from "./types"
import path from "path";
import fs from "fs";

export async function getWarehouseData() {
  const filePath = path.join(process.cwd(), 'src', 'listing.json');
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const rawData: any[] = JSON.parse(fileContent);

    const cells: { [key: string]: Cell } = {};
    const productsMap: { [key: string]: Product } = {};

    rawData.forEach((item: { Location: string; Volume?: number; ProductName?: string; ProductId?: number }) => {
      const location = item.Location;
      if (!location) return; // Skip if no location

      const locationParts = location.split('-');
      if (locationParts.length < 3) {
        console.warn(`Skipping entry with unexpected location format: ${location}`);
        return; // Skip if location format is unexpected
      }
      const [column, row, levelStr] = locationParts;
      const cellId = location; // Use full location as unique ID

      if (!cells[cellId]) { // Ensure cell exists even if empty
        cells[cellId] = { 
          id: cellId, 
          name: location, 
          level: parseInt(levelStr.replace('L', ''), 10) - 1,
          row: parseInt(row, 10) - 1,
          column: parseInt(column, 10) - 1,
          productId: null,
          productIds: [] 
        };
      }

      if (item.ProductId != null && item.ProductName != null && item.Volume != null) {
        const productIdStr = String(item.ProductId);
        const product: Product = {
          id: productIdStr,
          name: item.ProductName as string,
          description: `Volume: ${item.Volume}`,
          volume: item.Volume,
          popularityScore: Math.round(Math.random() * 100)
        };
        productsMap[productIdStr] = product;
        if (cells[cellId]) {
            cells[cellId].productIds.push(productIdStr);
        }
      }
    });

    const products = Object.values(productsMap);
    const populatedCells = Object.values(cells).map(cell => {
      if (cell.productIds.length > 0) {
        return { ...cell, productId: cell.productIds[0] };
      }
      return { ...cell, productId: null };
    });

    const levels = new Set(populatedCells.map(c => c.level));
    const rows = new Set(populatedCells.map(c => c.row));
    const columns = new Set(populatedCells.map(c => c.column));

    return { 
      cells: populatedCells, 
      products,
      warehouseLayout: {
        levels: levels.size,
        rows: rows.size,
        columns: columns.size,
        cellCapacity: 1000,
      }
    };
  } catch (error) {
    console.error('Failed to read or parse warehouse data:', error);
    throw new Error('Failed to load warehouse data.');
  }
}
