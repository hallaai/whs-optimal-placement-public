'use client';

import { MainLayout } from '@/components/main-layout';
import { ControlPanel } from '@/components/control-panel';
import { WarehouseMap } from '@/components/warehouse-map';
import { WarehouseProvider, useWarehouse } from '@/contexts/warehouse-context';
import { WarehouseCell } from '@/components/warehouse-cell';

function HomePageContent() {
  const { cells, products, loading, error } = useWarehouse();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <MainLayout>
      <div className="flex h-full">
        <div className="hidden lg:block w-96 border-r overflow-y-auto">
          <ControlPanel />
        </div>
        <div className="flex-1 flex flex-col">
          {/* Pass cells to WarehouseMap */}
          {cells && products && (
            <WarehouseMap />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function Home() {
  return (
    <WarehouseProvider>
      <HomePageContent />
    </WarehouseProvider>
  );
}
