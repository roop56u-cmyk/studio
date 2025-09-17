
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
  DialogClose,
} from "@/components/ui/dialog";
import { Gift, Loader2, ArrowRight } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WheelSlice } from "@/app/dashboard/admin/lucky-wheel/page";
import { cn } from "@/lib/utils";

interface LuckyWheelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const colors = ["#FFD700", "#FF6347", "#ADFF2F", "#8A2BE2", "#1E90FF", "#FF69B4", "#00CED1", "#FF4500"];

export function LuckyWheelDialog({ open, onOpenChange }: LuckyWheelDialogProps) {
  const { currentUser } = useAuth();
  const { addActivity, addRecharge, setIsInactiveWarningOpen } = useWallet();
  const { toast } = useToast();
  const [slices, setSlices] = useState<WheelSlice[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (open) {
      const storedSlices = localStorage.getItem("lucky_wheel_slices");
      if (storedSlices) {
        setSlices(JSON.parse(storedSlices));
      }

      if (currentUser) {
        const lastSpinDate = localStorage.getItem(`${currentUser.email}_last_wheel_spin`);
        const today = new Date().toISOString().split("T")[0];
        setCanSpin(lastSpinDate !== today);
      }
    } else {
        // Reset rotation when dialog closes
        setTimeout(() => setRotation(0), 500);
    }
  }, [currentUser, open]);
  
  const handleSpin = () => {
    if (!canSpin || isSpinning || !currentUser || slices.length === 0) return;

    if (currentUser.status !== 'active') {
        setIsInactiveWarningOpen(true);
        return;
    }
    
    setIsSpinning(true);

    let cumulativeProbability = 0;
    const random = Math.random() * 100;
    let winnerIndex = -1;
    
    for (let i=0; i<slices.length; i++) {
        cumulativeProbability += slices[i].probability;
        if (random < cumulativeProbability) {
            winnerIndex = i;
            break;
        }
    }
    
    if (winnerIndex === -1) {
        winnerIndex = slices.length - 1;
    }
    
    const selectedSlice = slices[winnerIndex];
    const sliceAngle = 360 / slices.length;
    const targetRotation = (360 * 5) + (360 - (winnerIndex * sliceAngle + sliceAngle / 2));
    
    setRotation(targetRotation);

    setTimeout(() => {
        const prizeAmount = selectedSlice.amount;
        if (prizeAmount > 0) {
            addRecharge(prizeAmount);
            addActivity(currentUser.email, {
                type: 'Lucky Wheel',
                description: `Won ${selectedSlice.name} from the lucky wheel.`,
                amount: prizeAmount,
                date: new Date().toISOString(),
            });
            toast({
                title: "You Won!",
                description: `Congratulations! You've won $${prizeAmount.toFixed(2)}. It has been added to your main balance.`,
            });
        } else {
             addActivity(currentUser.email, {
                type: 'Lucky Wheel',
                description: 'Spun the lucky wheel with no prize.',
                date: new Date().toISOString(),
            });
            toast({
                title: "Better Luck Next Time!",
                description: "You didn't win a prize this time. Try again tomorrow!",
            });
        }

        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem(`${currentUser.email}_last_wheel_spin`, today);
        setCanSpin(false);
        setIsSpinning(false);

    }, 4000); // Wait for spin animation to finish
  };
  
  const sliceAngle = 360 / (slices.length || 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 border-none text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Gift className="h-6 w-6" /> Daily Lucky Wheel
          </DialogTitle>
          <DialogDescription className="text-center text-white/80">
            Spin once a day for a chance to win instant rewards!
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
                        style={{
                            transform: `rotate(${i * sliceAngle}deg)`,
                            clipPath: `polygon(0 0, 100% 0, 100% 100%)`,
                        }}
                    >
                         <div
                            className="absolute w-full h-full"
                            style={{
                                transform: `rotate(${sliceAngle/2}deg)`,
                                transformOrigin: 'bottom right',
                                background: colors[i % colors.length],
                            }}
                         >
                            <span 
                                className="absolute block w-full text-center text-xs font-bold text-black/70"
                                style={{
                                    transform: `translateY(15px) rotate(${90-sliceAngle/2}deg)`,
                                }}
                            >
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
        <DialogFooter className="sm:justify-center">
          <Button
            size="lg"
            className="w-full bg-white text-primary hover:bg-white/90 disabled:animate-none"
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
          >
            {isSpinning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSpinning ? "Spinning..." : canSpin ? "Spin the Wheel!" : "Come Back Tomorrow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
