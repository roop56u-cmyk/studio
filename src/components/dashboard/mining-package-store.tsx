
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Gem, DollarSign, Clock, Gauge, ShoppingCart, CheckCircle } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import type { MiningPackage } from "@/app/dashboard/admin/tokenomics/page";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MiningPackageStore() {
  const [packages, setPackages] = useState<MiningPackage[]>([]);
  const { purchaseMiningPackage, mainBalance, purchasedMiningPackages } = useWallet();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("mining_packages");
    if (stored) {
      setPackages(JSON.parse(stored));
    }
  }, []);

  const handlePurchase = (pkg: MiningPackage) => {
    if (mainBalance < pkg.price) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Not enough USDT in your main wallet.'});
        return;
    }
    purchaseMiningPackage(pkg.id);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy a Mining Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mining Package Store</DialogTitle>
          <DialogDescription>Purchase a package to start earning tokens.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4 pr-4">
            {packages.map(pkg => {
              const isPurchased = purchasedMiningPackages.some(p => p.packageId === pkg.id && p.status === 'available');
              return (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Gem className="h-5 w-5 text-primary" />{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 text-sm">
                   <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-muted-foreground" /> Price: ${pkg.price}</div>
                   <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground" /> Duration: {pkg.duration} hrs</div>
                   <div className="flex items-center gap-1.5 col-span-2"><Gauge className="h-4 w-4 text-muted-foreground" /> Mining Rate: {pkg.miningRate} /hr</div>
                </CardContent>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button className="w-full" disabled={isPurchased}>
                                {isPurchased ? <><CheckCircle className="mr-2 h-4 w-4" /> Purchased (Ready)</> : 'Purchase'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to buy the "{pkg.name}" for ${pkg.price}? This will be deducted from your main wallet.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handlePurchase(pkg)}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
              </Card>
            )})}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

