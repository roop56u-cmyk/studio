
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import type { Request } from "@/contexts/RequestContext";

interface RechargePanelProps {
    onAddRequest: (request: Partial<Omit<Request, 'id' | 'date' | 'user' | 'status'>>) => void;
    onManageAddresses: () => void;
}

export function RechargePanel({ onAddRequest, onManageAddresses }: RechargePanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const { withdrawalAddress } = useWallet();
  const rechargeAddress = "0x4D26340f3B52DCf82dd537cBF3c7e4C1D9b53BDc";

  const [isAddressAlertOpen, setIsAddressAlertOpen] = useState(false);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rechargeAddress);
    setCopied(true);
    toast({
      title: "Address Copied!",
      description: "The USDT BEP20 address has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const proceedWithSubmit = () => {
     const numericAmount = parseFloat(amount);
     onAddRequest({
        type: 'Recharge',
        amount: numericAmount,
        address: withdrawalAddress?.address ?? null,
    });

    toast({
      title: "Recharge Request Submitted",
      description: `Your request to recharge ${numericAmount.toFixed(2)} USDT is pending approval.`,
    });
    setAmount("");
  }

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
    
    // Check 1: User must have a withdrawal address
    if (!withdrawalAddress) {
        setIsAddressAlertOpen(true);
        return;
    }

    // Check 2: Show confirmation dialog
    setIsConfirmAlertOpen(true);
  };


  return (
    <>
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

      {/* Alert for missing withdrawal address */}
      <AlertDialog open={isAddressAlertOpen} onOpenChange={setIsAddressAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Withdrawal Address Required</AlertDialogTitle>
                  <AlertDialogDescription>
                      Please update your USDT BEP20 withdrawal address first before making a recharge request.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onManageAddresses}>Update Address</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Alert for confirming the deposit source */}
      <AlertDialog open={isConfirmAlertOpen} onOpenChange={setIsConfirmAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deposit Source</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please make sure you updated same wallet withdrawal address from which you deposit or send usdt on above recharge address different address cause permanent loss of funds.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={proceedWithSubmit}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
