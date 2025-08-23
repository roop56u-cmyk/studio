
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
import { useRequests } from "@/contexts/RequestContext";
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
import { WithdrawalTimer } from "./withdrawal-timer";

interface WithdrawalPanelProps {
    onAddRequest: (request: Partial<Omit<Request, 'id' | 'date' | 'user' | 'status'>>) => void;
}


export function WithdrawalPanel({ onAddRequest }: WithdrawalPanelProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const { userRequests } = useRequests();

  const { 
      mainBalance, 
      requestWithdrawal, 
      withdrawalAddress, 
      clearWithdrawalAddress,
      currentLevel,
      minWithdrawalAmount,
      monthlyWithdrawalLimit,
      monthlyWithdrawalsCount,
      isWithdrawalRestrictionEnabled,
      withdrawalRestrictionDays,
      withdrawalRestrictionMessage,
      withdrawalFee
  } = useWallet();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isRestrictionAlertOpen, setIsRestrictionAlertOpen] = useState(false);
  const [isPendingAlertOpen, setIsPendingAlertOpen] = useState(false);
  const [isLimitAlertOpen, setIsLimitAlertOpen] = useState(false);
  const [isMinAmountAlertOpen, setIsMinAmountAlertOpen] = useState(false);
  const [restrictionStartDate, setRestrictionStartDate] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;

  const adminFee = useMemo(() => {
    return numericAmount * (withdrawalFee / 100);
  }, [numericAmount, withdrawalFee]);

  const netWithdrawal = numericAmount - adminFee;

  
  const handleOpenEditDialog = () => {
    setIsAddressDialogOpen(true);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasPendingWithdrawal = userRequests.some(req => req.type === 'Withdrawal' && req.status === 'Pending');
    if (hasPendingWithdrawal) {
        setIsPendingAlertOpen(true);
        return;
    }

    if (monthlyWithdrawalsCount >= monthlyWithdrawalLimit) {
        setIsLimitAlertOpen(true);
        return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount to withdraw." });
        return;
    }

    if (numericAmount < minWithdrawalAmount) {
      setIsMinAmountAlertOpen(true);
      return;
    }

     if (!withdrawalAddress) {
        toast({ variant: "destructive", title: "No Address Set", description: "Please set a withdrawal address before withdrawing." });
        return;
    }
    if(numericAmount > mainBalance) {
        toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot withdraw more than your main balance of $${mainBalance.toFixed(2)}.` });
        return;
    }

    const userIsEligibleForRestriction = mainBalance > 0 || currentLevel >= 1;

    if (isWithdrawalRestrictionEnabled && userIsEligibleForRestriction) {
        const key = `${currentUser?.email}_restrictionStartDate`;
        let startDate = localStorage.getItem(key);
        if (!startDate) {
            startDate = new Date().toISOString();
            localStorage.setItem(key, startDate);
        }
        setRestrictionStartDate(startDate);

        const restrictionEndTime = new Date(startDate).getTime() + (withdrawalRestrictionDays * 24 * 60 * 60 * 1000);
        
        if (Date.now() < restrictionEndTime) {
            setIsRestrictionAlertOpen(true);
            return;
        }
    }
    
    requestWithdrawal(numericAmount);
    onAddRequest({ amount: numericAmount, address: withdrawalAddress.address, type: 'Withdrawal' });
    toast({ title: "Withdrawal Request Submitted", description: `Your request to withdraw ${numericAmount.toFixed(2)} USDT is pending approval.` });
    setAmount("");
  };

  const currentUser = { email: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).email : null };


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
                 <p className="text-xs text-muted-foreground">Minimum withdrawal: ${minWithdrawalAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-md border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin Fee ({withdrawalFee.toFixed(2)}%):</span>
                    <span className="font-medium">${adminFee.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-semibold">
                    <span>You will receive:</span>
                    <span>${netWithdrawal > 0 ? netWithdrawal.toFixed(2) : '0.00'}</span>
                </div>
                 <div className="flex justify-between mt-2 pt-2 border-t">
                    <span className="text-muted-foreground">Monthly Limit:</span>
                    <span className="font-medium">{monthlyWithdrawalsCount} / {monthlyWithdrawalLimit}</span>
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

     <AlertDialog open={isRestrictionAlertOpen} onOpenChange={setIsRestrictionAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Withdrawal Restricted</AlertDialogTitle>
                <AlertDialogDescription>
                   {withdrawalRestrictionMessage}
                </AlertDialogDescription>
            </AlertDialogHeader>
             {restrictionStartDate && (
                <WithdrawalTimer 
                    waitDays={withdrawalRestrictionDays} 
                    startDate={restrictionStartDate}
                />
            )}
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsRestrictionAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isPendingAlertOpen} onOpenChange={setIsPendingAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Pending Request</AlertDialogTitle>
                <AlertDialogDescription>
                    You already have a withdrawal request pending. Please wait for it to be processed before submitting a new one.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsPendingAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isLimitAlertOpen} onOpenChange={setIsLimitAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Monthly Limit Reached</AlertDialogTitle>
                <AlertDialogDescription>
                    You have reached your monthly withdrawal limit of {monthlyWithdrawalLimit} for Level {currentLevel}. Please try again next month.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsLimitAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMinAmountAlertOpen} onOpenChange={setIsMinAmountAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Minimum Withdrawal Amount</AlertDialogTitle>
                <AlertDialogDescription>
                    The minimum withdrawal amount for Level {currentLevel} is ${minWithdrawalAmount.toFixed(2)}. Please enter a higher amount.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsMinAmountAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
