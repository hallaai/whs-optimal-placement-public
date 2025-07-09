import { Warehouse } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Warehouse className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-xl font-headline font-semibold text-primary-foreground tracking-tight">
        <span className='text-foreground'>Warehouse</span>
        <span className='text-primary'>Navigator</span>
      </h1>
    </div>
  );
}
