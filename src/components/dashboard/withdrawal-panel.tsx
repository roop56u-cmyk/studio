
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { AddressDialog } from "./address-dialog";
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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { WithdrawalAddress } from "@/contexts/WalletContext";
import { WithdrawalTimer } from "./withdrawal-timer";

interface WithdrawalPanelProps {
    onAddRequest: (request: Partial<Omit<Request, 'id' | 'date' | 'user' | 'status'>>) => void;
}

const WITHDRAWAL_WAIT_DAYS = 45;

export function WithdrawalPanel({ onAddRequest }: WithdrawalPanelProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const { 
      getWalletData, 
      mainBalance, 
      requestWithdrawal, 
      withdrawalAddress, 
      clearWithdrawalAddress,
      firstDepositDate,
  } = useWallet();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isRestrictionActive, setIsRestrictionActive] = useState(true);

  const { level } = getWalletData();
  const numericAmount = parseFloat(amount) || 0;

  const adminFee = useMemo(() => {
    if (level === 1) return numericAmount * 0.05; // 5%
    if (level === 2) return numericAmount * 0.03; // 3%
    if (level >= 3) return numericAmount * 0.01; // 1%
    return 0; // No fee for level 0
  }, [numericAmount, level]);

  const netWithdrawal = numericAmount - adminFee;

  useEffect(() => {
    if (!firstDepositDate) {
      setIsRestrictionActive(true);
      return;
    }
    const firstDepositTime = new Date(firstDepositDate).getTime();
    const restrictionEndTime = firstDepositTime + (WITHDRAWAL_WAIT_DAYS * 24 * 60 * 60 * 1000);
    
    const interval = setInterval(() => {
        if (Date.now() >= restrictionEndTime) {
            setIsRestrictionActive(false);
            clearInterval(interval);
        }
    }, 1000);

    return () => clearInterval(interval);

  }, [firstDepositDate]);
  
  const handleOpenEditDialog = () => {
    setIsAddressDialogOpen(true);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestrictionActive) {
      toast({
          variant: "destructive",
          title: "Withdrawal Locked",
          description: `You must wait ${WITHDRAWAL_WAIT_DAYS} days after your first deposit to make a withdrawal.`,
      });
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Please enter a valid amount to withdraw.",
        });
        return;
    }
     if (!withdrawalAddress) {
        toast({
            variant: "destructive",
            title: "No Address Set",
            description: "Please set a withdrawal address before withdrawing.",
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
        address: withdrawalAddress.address,
        type: 'Withdrawal',
    });

    toast({
      title: "Withdrawal Request Submitted",
      description: `Your request to withdraw ${numericAmount.toFixed(2)} USDT is pending approval. The amount has been deducted from your balance.`,
    });

    setAmount("");
  };

  if (isRestrictionActive) {
    return <WithdrawalTimer firstDepositDate={firstDepositDate} waitDays={WITHDRAWAL_WAIT_DAYS} />
  }

  return (
    <>
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
                <div className="flex items-center gap-2">
                    {withdrawalAddress ? (
                       <Input 
                            value={`${withdrawalAddress.name} - ${withdrawalAddress.address.slice(0,6)}...${withdrawalAddress.address.slice(-4)}`}
                            readOnly
                        />
                    ) : (
                        <Button variant="outline" className="w-full justify-start text-muted-foreground" type="button" onClick={() => setIsAddressDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Withdrawal Address
                        </Button>
                    )}
                </div>
            </div>
             <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={handleOpenEditDialog}>
                    <Edit className="mr-2 h-4 w-4" />
                    {withdrawalAddress ? 'Edit' : 'Add'} Address
                </Button>
                {withdrawalAddress && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" type="button" className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your saved withdrawal address.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearWithdrawalAddress}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
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
            <Button type="submit" className="w-full" disabled={!withdrawalAddress}>
              Request Withdrawal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    <AddressDialog 
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        address={withdrawalAddress}
    />
    </>
  );
}
