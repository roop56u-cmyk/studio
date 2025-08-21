
"use client";

import { useState } from "react";
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

interface WithdrawalPanelProps {
    onAddRequest: (request: Omit<Request, 'id' | 'date' | 'user' | 'status'>) => void;
}

export function WithdrawalPanel({ onAddRequest }: WithdrawalPanelProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");


  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
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

    onAddRequest({
        amount: numericAmount,
        address,
        type: 'Withdrawal',
    });

    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal request is pending approval from the admin.",
    });

    setAddress("");
    setAmount("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Form</CardTitle>
        <CardDescription>
          Submit a request to withdraw your funds.
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
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="100.00" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                />
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
