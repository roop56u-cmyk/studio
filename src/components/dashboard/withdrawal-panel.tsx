
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface WithdrawalPanelProps {
    onAddRequest: (request: Partial<Omit<Request, 'id' | 'date' | 'user' | 'status'>>) => void;
}

export function WithdrawalPanel({ onAddRequest }: WithdrawalPanelProps) {
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { getWalletData, mainBalance, requestWithdrawal, withdrawalAddresses, deleteWithdrawalAddress } = useWallet();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<WithdrawalAddress | null>(null);

  const { level } = getWalletData();
  const numericAmount = parseFloat(amount) || 0;

  const adminFee = useMemo(() => {
    if (level === 1) return numericAmount * 0.05; // 5%
    if (level === 2) return numericAmount * 0.03; // 3%
    if (level >= 3) return numericAmount * 0.01; // 1%
    return 0; // No fee for level 0
  }, [numericAmount, level]);

  const netWithdrawal = numericAmount - adminFee;

  const handleOpenAddDialog = () => {
    setEditingAddress(null);
    setIsAddressDialogOpen(true);
  };
  
  const handleOpenEditDialog = () => {
    const addressToEdit = withdrawalAddresses.find(addr => addr.address === selectedAddress);
    if (addressToEdit) {
      setEditingAddress(addressToEdit);
      setIsAddressDialogOpen(true);
    }
  };

  const handleDeleteAddress = () => {
      const addressToDelete = withdrawalAddresses.find(addr => addr.address === selectedAddress);
      if (addressToDelete) {
          deleteWithdrawalAddress(addressToDelete.id);
          setSelectedAddress(""); // Reset selection
      }
  };


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
     if (!selectedAddress) {
        toast({
            variant: "destructive",
            title: "Invalid Address",
            description: "Please select a withdrawal address.",
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
        address: selectedAddress,
        type: 'Withdrawal',
    });

    toast({
      title: "Withdrawal Request Submitted",
      description: `Your request to withdraw ${numericAmount.toFixed(2)} USDT is pending approval. The amount has been deducted from your balance.`,
    });

    setSelectedAddress("");
    setAmount("");
  };

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
                    {withdrawalAddresses.length > 0 ? (
                        <Select onValueChange={setSelectedAddress} value={selectedAddress}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a saved address" />
                            </SelectTrigger>
                            <SelectContent>
                                {withdrawalAddresses.map(addr => (
                                    <SelectItem key={addr.id} value={addr.address}>{addr.name} - {addr.address.slice(0,6)}...{addr.address.slice(-4)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Button variant="outline" className="w-full justify-start text-muted-foreground" type="button" onClick={handleOpenAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add your first address
                        </Button>
                    )}
                    
                    <Button variant="ghost" size="icon" type="button" onClick={handleOpenAddDialog} className="shrink-0">
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only">Add new address</span>
                    </Button>
                    <Button variant="ghost" size="icon" type="button" onClick={handleOpenEditDialog} disabled={!selectedAddress} className="shrink-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit selected address</span>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" type="button" disabled={!selectedAddress} className="shrink-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete selected address</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the selected address.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAddress}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </div>
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
            <Button type="submit" className="w-full" disabled={!selectedAddress}>
              Request Withdrawal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    <AddressDialog 
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        address={editingAddress}
    />
    </>
  );
}
