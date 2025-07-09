"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWarehouse } from '@/contexts/warehouse-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Package, PlusCircle, Move, XCircle, Info, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

const newProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  volume: z.coerce.number().min(1, "Volume must be positive").max(100, "Volume cannot exceed cell capacity"),
});

export function ControlPanel() {
  const {
    settings,
    setSettings,
    addProduct,
    selectedCell,
    getProductById,
    startMove,
    movingProduct,
    cancelMove
  } = useWarehouse();
  const { toast } = useToast()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(newProductSchema),
    defaultValues: { name: '', volume: 50 },
  });

  const onSubmit = (data: z.infer<typeof newProductSchema>) => {
    addProduct(data.name, data.volume);
    toast({
        title: "Product Added",
        description: `New product "${data.name}" created. Optimal placement suggested on the map.`,
    });
    reset();
  };
  
  const selectedProduct = getProductById(selectedCell?.productId ?? null);

  return (
    <div className="h-full bg-sidebar flex flex-col">
      <div className="p-4 border-b lg:border-b-0">
        <h2 className="text-lg font-semibold hidden lg:block">Controls</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {movingProduct ? (
            <Card className="bg-primary/10 border-primary shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Move className="h-5 w-5"/>
                        <span>Moving Product</span>
                    </CardTitle>
                    <CardDescription>Select an empty green cell on the map to place the product.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button onClick={cancelMove} variant="destructive" className="w-full">
                        <XCircle className="mr-2 h-4 w-4"/>
                        Cancel Move
                    </Button>
                </CardContent>
            </Card>
        ) : selectedCell ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/>Cell Information</CardTitle>
              <CardDescription>
                Level {selectedCell.level + 1}, Row {selectedCell.row + 1}, Column {selectedCell.column + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProduct ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{selectedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">Volume: {selectedProduct.volume} units</p>
                    </div>
                  </div>
                  <Button onClick={() => startMove(selectedCell)} className="w-full">
                    <Move className="mr-2 h-4 w-4" /> Move Product
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">This cell is empty.</p>
              )}
            </CardContent>
          </Card>
        ) : (
             <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-lg">
                <p>Select a cell on the map to see its details or initiate actions.</p>
            </div>
        )}

        <Accordion type="single" collapsible defaultValue="add-product">
          <AccordionItem value="add-product">
            <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Add New Product</div>
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="volume">Volume</Label>
                   <Controller
                      name="volume"
                      control={control}
                      render={({ field }) => (
                         <Input type="number" id="volume" {...field} />
                      )}
                    />
                  {errors.volume && <p className="text-destructive text-xs mt-1">{errors.volume.message}</p>}
                </div>
                <Button type="submit" className="w-full">Add and Suggest Placement</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="settings">
            <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2"><Settings className="h-5 w-5" /> Settings</div>
            </AccordionTrigger>
            <AccordionContent>
               <div className="space-y-4 pt-2">
                  <div>
                    <Label>Chain Shift Length: {settings.chainLength}</Label>
                    <Slider
                      value={[settings.chainLength]}
                      onValueChange={(value) => setSettings({ ...settings, chainLength: value[0] })}
                      min={1}
                      max={10}
                      step={1}
                    />
                     <p className="text-xs text-muted-foreground mt-1">
                      Length=1 is a direct move. >1 shifts products in a chain.
                    </p>
                  </div>
               </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
