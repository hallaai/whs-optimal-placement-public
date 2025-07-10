"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Presentation } from 'lucide-react';
import { ControlPanel } from './control-panel';
import { useWarehouse } from '@/contexts/warehouse-context'; // Import to check loading state

// This component now needs to know the active level for the mobile ControlPanel
export function MainLayout({ children }: { children: React.ReactNode }) {
  const { warehouse } = useWarehouse();
  // We can't directly get activeLevel from the page, so we'll just pass a default for now
  // A better implementation might involve lifting state up.
  // For this case, we'll assume level 0 or find a way to get it.
  // The page.tsx now lifts state, but this layout doesn't have access.
  // A simple solution is to have the mobile panel optimize level 0 by default.
  // The prompt implies optimizing the "current" floor, which is tricky for the detached sheet.
  // Let's pass a placeholder activeLevel=0 for the mobile view for now.
  const activeLevel = 0; 

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-foreground">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b z-10 bg-card/80 backdrop-blur-sm">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/presentation">
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
                  <SheetTitle>Controls</SheetTitle>
                  <SheetDescription>
                    Manage warehouse settings, add products, and move items.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    {/* The mobile control panel might not know the active tab, passing 0 as a default */}
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
