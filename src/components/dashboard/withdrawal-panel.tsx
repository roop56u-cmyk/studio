
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Request } from "@/contexts/RequestContext";
import { useWallet } from "@/contexts/WalletContext";

interface WithdrawalPanelProps {
    onAddRequest: (request: Omit<Request, 'id' | 'date' | 'user' | 'status'>) => void;
}

export function WithdrawalPanel({ onAddRequest }: WithdrawalPanelProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { getWalletData, mainBalance, requestWithdrawal } = useWallet();

  const { level } = getWalletData();
  const numericAmount = parseFloat(amount) || 0;

  const adminFee = useMemo(() => {
    if (level === 1) return numericAmount * 0.05; // 5%
    if (level === 2) return numericAmount * 0.03; // 3%
    if (level >= 3) return numericAmount * 0.01; // 1%
    return 0; // No fee for level 0
  }, [numericAmount, level]);

  const netWithdrawal = numericAmount - adminFee;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Please enter a valid amount to withdraw.",
        });
        return;
    }
     if (!address) {
        toast({
            variant: "destructive",
            title: "Invalid Address",
            description: "Please enter a valid withdrawal address.",
        });
        return;
    }

    if(numericAmount > mainBalance) {
        toast({
            variant: "destructive",
            title: "Insufficient Funds",
            description: `You cannot withdraw more than your main balance of $${mainBalance.toFixed(2)}.`,
        });
        return;
    }
    
    // Deduct from balance immediately
    requestWithdrawal(numericAmount);

    onAddRequest({
        amount: numericAmount,
        address,
        type: 'Withdrawal',
    });

    toast({
      title: "Withdrawal Request Submitted",
      description: `Your request to withdraw ${numericAmount.toFixed(2)} USDT is pending approval. The amount has been deducted from your balance.`,
    });

    setAddress("");
    setAmount("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Form</CardTitle>
        <CardDescription>
          Submit a request to withdraw your funds. Admin fees apply.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleWithdraw}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-address">
                Your USDT BEP20 Address
              </Label>
              <Input 
                id="withdrawal-address" 
                placeholder="0x..." 
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDT)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="100.00" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="rounded-md border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin Fee ({level === 1 ? '5%' : level === 2 ? '3%' : level >= 3 ? '1%' : '0%'}):</span>
                    <span className="font-medium">${adminFee.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-semibold">
                    <span>You will receive:</span>
                    <span>${netWithdrawal > 0 ? netWithdrawal.toFixed(2) : '0.00'}</span>
                </div>
            </div>
            <Button type="submit" className="w-full">
              Request Withdrawal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
