
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Gift, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WheelSlice } from "@/app/dashboard/admin/lucky-wheel/page";

export function LuckyWheelPanel() {
  const { currentUser } = useAuth();
  const { addActivity, addRecharge, setIsInactiveWarningOpen } = useWallet();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [slices, setSlices] = useState<WheelSlice[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const storedEnabled = localStorage.getItem("lucky_wheel_enabled");
    if (storedEnabled) {
      setIsEnabled(JSON.parse(storedEnabled));
    }
    const storedSlices = localStorage.getItem("lucky_wheel_slices");
    if (storedSlices) {
      setSlices(JSON.parse(storedSlices));
    }

    if (currentUser) {
      const lastSpinDate = localStorage.getItem(`${currentUser.email}_last_wheel_spin`);
      const today = new Date().toISOString().split("T")[0];
      if (lastSpinDate !== today) {
        setCanSpin(true);
      }
    }
  }, [currentUser]);

  const handleSpin = () => {
    if (!canSpin || isSpinning || !currentUser) return;

    if (currentUser.status !== 'active') {
        setIsInactiveWarningOpen(true);
        return;
    }
    
    setIsSpinning(true);

    // Simulate spinning animation
    setTimeout(() => {
        let cumulativeProbability = 0;
        const random = Math.random() * 100;
        let selectedSlice: WheelSlice | null = null;
        
        for (const slice of slices) {
            cumulativeProbability += slice.probability;
            if (random < cumulativeProbability) {
                selectedSlice = slice;
                break;
            }
        }
        
        if (!selectedSlice) { // Fallback in case of rounding errors
            selectedSlice = slices[slices.length - 1];
        }

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

    }, 2000); // Simulate spin duration
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Daily Lucky Wheel
        </CardTitle>
        <CardDescription className="text-white/80">
          Spin once a day for a chance to win instant rewards!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Button
          size="lg"
          className="bg-white text-primary hover:bg-white/90 animate-pulse disabled:animate-none"
          onClick={handleSpin}
          disabled={!canSpin || isSpinning}
        >
          {isSpinning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isSpinning ? "Spinning..." : canSpin ? "Spin the Wheel!" : "Come Back Tomorrow"}
        </Button>
      </CardContent>
    </Card>
  );
}
