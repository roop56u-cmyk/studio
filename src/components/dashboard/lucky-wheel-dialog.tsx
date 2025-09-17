
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Gift, Loader2, ArrowRight, ShoppingCart } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WheelSlice, SpinPackage } from "@/app/dashboard/admin/lucky-wheel/page";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LuckyWheelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const colors = ["#FFD700", "#FF6347", "#ADFF2F", "#8A2BE2", "#1E90FF", "#FF69B4", "#00CED1", "#FF4500"];

const SpinPurchaseDialog = ({ onPurchase }: { onPurchase: (pkg: SpinPackage) => void }) => {
  const [packages, setPackages] = useState<SpinPackage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("lucky_wheel_packages");
    if (stored) {
      setPackages(JSON.parse(stored).filter((p: SpinPackage) => p.enabled));
    }
  }, []);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Buy More Spins</DialogTitle>
        <DialogDescription>Purchase a package to get extra spins for the Lucky Wheel.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[40vh]">
        <div className="space-y-4 pr-4 py-2">
          {packages.map(pkg => (
             <AlertDialog key={pkg.id}>
                <AlertDialogTrigger asChild>
                   <Card className="cursor-pointer hover:border-primary">
                        <CardHeader>
                            <CardTitle className="text-base">{pkg.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Spins: <strong className="text-primary">{pkg.spinsGranted}</strong></p>
                        </CardContent>
                         <CardFooter>
                            <p className="font-bold text-lg">${pkg.price.toFixed(2)}</p>
                        </CardFooter>
                    </Card>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to buy the "{pkg.name}" for ${pkg.price.toFixed(2)}? This will be deducted from your main wallet.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onPurchase(pkg)}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
          ))}
          {packages.length === 0 && <p className="text-center text-muted-foreground">No spin packages are available.</p>}
        </div>
      </ScrollArea>
    </DialogContent>
  );
};


export function LuckyWheelDialog({ open, onOpenChange }: LuckyWheelDialogProps) {
  const { currentUser } = useAuth();
  const { addActivity, addRecharge, setIsInactiveWarningOpen, extraSpins, purchaseSpins } = useWallet();
  const { toast } = useToast();
  const [slices, setSlices] = useState<WheelSlice[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const storedSlices = localStorage.getItem("lucky_wheel_slices");
      if (storedSlices) setSlices(JSON.parse(storedSlices));
      if (currentUser) {
        const lastSpinDate = localStorage.getItem(`${currentUser.email}_last_wheel_spin`);
        const today = new Date().toISOString().split("T")[0];
        setCanSpin(lastSpinDate !== today);
      }
    } else {
        setTimeout(() => setRotation(0), 500);
    }
  }, [currentUser, open]);
  
  const handleSpin = () => {
    if ((!canSpin && extraSpins === 0) || isSpinning || !currentUser || slices.length === 0) return;
    if (currentUser.status !== 'active') { setIsInactiveWarningOpen(true); return; }
    
    setIsSpinning(true);

    let cumulativeProbability = 0;
    const random = Math.random() * 100;
    let winnerIndex = -1;
    for (let i=0; i<slices.length; i++) {
        cumulativeProbability += slices[i].probability;
        if (random < cumulativeProbability) { winnerIndex = i; break; }
    }
    if (winnerIndex === -1) winnerIndex = slices.length - 1;
    
    const selectedSlice = slices[winnerIndex];
    const sliceAngle = 360 / slices.length;
    const targetRotation = (360 * 5) + (360 - (winnerIndex * sliceAngle + sliceAngle / 2));
    
    setRotation(targetRotation);

    setTimeout(() => {
        const prizeAmount = selectedSlice.amount;
        let isFreeSpin = canSpin;

        if (isFreeSpin) {
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem(`${currentUser.email}_last_wheel_spin`, today);
            setCanSpin(false);
        } else {
            // This was an extra spin
            // The purchaseSpins function already decrements the count
        }

        if (prizeAmount > 0) {
            addRecharge(prizeAmount);
            addActivity(currentUser.email, {
                type: 'Lucky Wheel',
                description: `Won ${selectedSlice.name} from a ${isFreeSpin ? 'free' : 'paid'} spin.`,
                amount: prizeAmount,
                date: new Date().toISOString(),
            });
            toast({ title: "You Won!", description: `Congratulations! You've won $${prizeAmount.toFixed(2)}. It has been added to your main balance.` });
        } else {
             addActivity(currentUser.email, { type: 'Lucky Wheel', description: `Spun the lucky wheel with no prize (${isFreeSpin ? 'free' : 'paid'} spin).`, date: new Date().toISOString() });
            toast({ title: "Better Luck Next Time!", description: "You didn't win a prize this time. Try again tomorrow!" });
        }
        setIsSpinning(false);
    }, 4000);
  };
  
  const handlePurchasePackage = (pkg: SpinPackage) => {
    purchaseSpins(pkg);
    setIsPurchaseDialogOpen(false);
  }

  const sliceAngle = 360 / (slices.length || 1);
  const showBuyButton = !canSpin && extraSpins === 0;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 border-none text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Gift className="h-6 w-6" /> Daily Lucky Wheel
          </DialogTitle>
          <DialogDescription className="text-center text-white/80">
            {canSpin ? "You have 1 free spin for today!" : extraSpins > 0 ? `You have ${extraSpins} extra spin(s)!` : "Your free spin is used up. Come back tomorrow!"}
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-72 h-72 mx-auto my-8 flex items-center justify-center">
            <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-yellow-400 z-10 animate-pulse" />
            <div
                className="relative w-full h-full rounded-full border-4 border-yellow-400 transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {slices.map((slice, i) => (
                    <div
                        key={slice.id}
                        className="absolute w-1/2 h-1/2 top-0 left-0 origin-bottom-right"
                        style={{ transform: `rotate(${i * sliceAngle}deg)`, clipPath: `polygon(0 0, 100% 0, 100% 100%)` }}
                    >
                         <div className="absolute w-full h-full" style={{ transform: `rotate(${sliceAngle/2}deg)`, transformOrigin: 'bottom right', background: colors[i % colors.length] }}>
                            <span className="absolute block w-full text-center text-xs font-bold text-black/70" style={{ transform: `translateY(15px) rotate(${90-sliceAngle/2}deg)` }}>
                                {slice.name}
                            </span>
                         </div>
                    </div>
                ))}
            </div>
            <div className="absolute w-16 h-16 bg-gray-800 rounded-full border-4 border-yellow-500 flex items-center justify-center">
                <Gift className="w-8 h-8 text-yellow-400" />
            </div>
        </div>
        <DialogFooter className="sm:justify-center flex-col sm:flex-col sm:space-x-0 gap-2">
          <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 disabled:animate-none" onClick={handleSpin} disabled={(!canSpin && extraSpins === 0) || isSpinning}>
            {isSpinning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSpinning ? "Spinning..." : (canSpin || extraSpins > 0) ? "Spin the Wheel!" : "Come Back Tomorrow"}
          </Button>
          {showBuyButton && (
            <Button size="sm" variant="outline" className="w-full" onClick={() => setIsPurchaseDialogOpen(true)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Buy More Spins
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <SpinPurchaseDialog onPurchase={handlePurchasePackage} />
    </Dialog>
    </>
  );
}
