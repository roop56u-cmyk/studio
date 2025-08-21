
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
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import type { Request } from "@/contexts/RequestContext";

interface RechargePanelProps {
    onRecharge: (amount: number) => void;
    onAddRequest: (request: Omit<Request, 'id' | 'date' | 'user' | 'status'>) => void;
}

export function RechargePanel({ onRecharge, onAddRequest }: RechargePanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const { getWalletData } = useWallet();
  const rechargeAddress = "0x4D26340f3B52DCf82dd537cBF3c7e4C1D9b53BDc";

  const handleCopy = () => {
    navigator.clipboard.writeText(rechargeAddress);
    setCopied(true);
    toast({
      title: "Address Copied!",
      description: "The USDT BEP20 address has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Please enter a valid amount for the recharge request.",
        });
        return;
    }
    
    // In a real scenario, you'd wait for admin approval.
    // Here we'll just create the request for the admin to see.
    onAddRequest({
        ...getWalletData(),
        type: 'Recharge',
        amount: numericAmount,
        address: null, // No withdrawal address for recharges
    });

    toast({
      title: "Recharge Request Submitted",
      description: `Your request to recharge ${numericAmount.toFixed(2)} USDT is pending approval.`,
    });
    setAmount("");
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recharge Funds</CardTitle>
        <CardDescription>
          Submit a request to add funds to your main balance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div className="space-y-4">
                <Label htmlFor="recharge-address">Official USDT BEP20 Recharge Address</Label>
                <div className="flex items-center space-x-2">
                <Input
                    id="recharge-address"
                    value={rechargeAddress}
                    readOnly
                    className="font-mono text-center text-sm"
                />
                <Button variant="outline" size="icon" type="button" onClick={handleCopy}>
                    {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                    ) : (
                    <Copy className="h-4 w-4" />
                    )}
                </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                First send funds to the address above, then submit a request below with the amount you sent.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="amount">Recharge Amount (USDT)</Label>
                <Input 
                    id="amount" 
                    type="number" 
                    placeholder="100.00" 
                    required 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full">Submit Recharge Request</Button>
        </form>
      </CardContent>
    </Card>
  );
}
