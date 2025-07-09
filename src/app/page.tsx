import { MainLayout } from '@/components/main-layout';
import { ControlPanel } from '@/components/control-panel';
import { WarehouseMap } from '@/components/warehouse-map';
import { WarehouseProvider } from '@/contexts/warehouse-context';

export default function Home() {
  return (
    <WarehouseProvider>
      <MainLayout>
        <div className="flex h-full">
          <div className="hidden lg:block w-96 border-r overflow-y-auto">
            <ControlPanel />
          </div>
          <div className="flex-1 flex flex-col">
            <WarehouseMap />
          </div>
        </div>
      </MainLayout>
    </WarehouseProvider>
  );
}
