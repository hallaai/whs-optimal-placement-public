"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Presentation } from 'lucide-react';
import { ControlPanel } from './control-panel';
import { useWarehouse } from '@/contexts/warehouse-context';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { warehouse } = useWarehouse();
  const activeLevel = 0; 

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-foreground">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b z-10 bg-card/80 backdrop-blur-sm">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/presentation.html" target="_blank">
              <Presentation className="mr-2 h-4 w-4" />
              How it Works
            </Link>
          </Button>
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open controls</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Warehouse Navigator</SheetTitle>
                  <SheetDescription>
                    Manage settings, add products, and move items.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <ControlPanel activeLevel={activeLevel} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
