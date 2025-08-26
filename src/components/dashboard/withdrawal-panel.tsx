
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WithdrawalAddress } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { levels as defaultLevels } from "./level-tiers";
import { platformMessages } from "@/lib/platform-messages";

interface WithdrawalPanelProps {
    onAddRequest: (request: Partial<Omit<Request, 'id' | 'date' | 'user' | 'status'>>) => void;
}

const getGlobalSetting = (key: string, defaultValue: any, isJson: boolean = false) => {
    if (typeof window === 'undefined') {
    return defaultValue;
    }
    try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        if (isJson) {
            return JSON.parse(storedValue);
        }
        return storedValue;
    }
    } catch (error) {
    console.error(`Failed to parse global setting ${key} from localStorage`, error);
    }
    return defaultValue;
};


export function WithdrawalPanel({ onAddRequest }: WithdrawalPanelProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const { userRequests } = useRequests();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<any>({});

  useEffect(() => {
    const storedMessages = getGlobalSetting("platform_custom_messages", {}, true);
    const defaults: any = {};
    Object.entries(platformMessages).forEach(([catKey, category]) => {
      defaults[catKey] = {};
      Object.entries(category.messages).forEach(([msgKey, msgItem]) => {
        defaults[catKey][msgKey] = msgItem.defaultValue;
      });
    });

    // Deep merge defaults with stored messages
    const mergedMessages = {
      ...defaults,
      ...storedMessages,
      withdrawal: { ...defaults.withdrawal, ...(storedMessages.withdrawal || {}) },
      recharge: { ...defaults.recharge, ...(storedMessages.recharge || {}) }
    };
    setMessages(mergedMessages);

  }, []);

  const { 
      mainBalance, 
      requestWithdrawal, 
      withdrawalAddresses = [],
      deleteWithdrawalAddress,
      currentLevel,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      monthlyWithdrawalLimit,
      monthlyWithdrawalsCount,
      isWithdrawalRestrictionEnabled,
      withdrawalRestrictionDays,
      multipleAddressesEnabled,
      addWithdrawalAddress,
  } = useWallet();
  
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<WithdrawalAddress | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [isRestrictionAlertOpen, setIsRestrictionAlertOpen] = useState(false);
  const [isPendingAlertOpen, setIsPendingAlertOpen] = useState(false);
  const [isLimitAlertOpen, setIsLimitAlertOpen] = useState(false);
  const [isMaxAmountAlertOpen, setIsMaxAmountAlertOpen] = useState(false);
  const [restrictionStartDate, setRestrictionStartDate] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;

  const configuredLevels = useMemo(() => {
    return getGlobalSetting('platform_levels', defaultLevels, true);
  }, []);

  const withdrawalFeeRate = useMemo(() => {
     const levelData = configuredLevels.find(l => l.level === currentLevel);
     return levelData ? levelData.withdrawalFee : 0;
  }, [currentLevel, configuredLevels]);
  
  const adminFee = useMemo(() => {
    return numericAmount * (withdrawalFeeRate / 100);
  }, [numericAmount, withdrawalFeeRate]);

  const netWithdrawal = numericAmount - adminFee;

  useEffect(() => {
      if (withdrawalAddresses.length > 0 && !selectedAddressId) {
          const enabledAddress = withdrawalAddresses.find(a => a.enabled);
          if(enabledAddress) setSelectedAddressId(enabledAddress.id);
          else if (withdrawalAddresses.length > 0) setSelectedAddressId(withdrawalAddresses[0].id);
      }
  }, [withdrawalAddresses, selectedAddressId]);
  
  const handleAddNewAddress = () => {
    if (!multipleAddressesEnabled && withdrawalAddresses.length > 0) {
        toast({
            title: "Multiple Addresses Disabled",
            description: "The admin has disabled adding more than one withdrawal address.",
            variant: "destructive"
        });
        return;
    }
    setEditingAddress(null);
    setIsAddressDialogOpen(true);
  };
  
  const handleEditAddress = (addressId: string) => {
    const addressToEdit = withdrawalAddresses.find(a => a.id === addressId);
    if(addressToEdit) {
      setEditingAddress(addressToEdit);
      setIsAddressDialogOpen(true);
    }
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAddress = withdrawalAddresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
        toast({ variant: "destructive", title: "No Address Selected", description: "Please select a withdrawal address." });
        return;
    }

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

    if (numericAmount > maxWithdrawalAmount && maxWithdrawalAmount > 0) {
      setIsMaxAmountAlertOpen(true);
      return;
    }

    if(numericAmount > mainBalance) {
        toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot withdraw more than your main balance of $${mainBalance.toFixed(2)}.` });
        return;
    }

    const userIsEligibleForRestriction = mainBalance > 0 || currentLevel >= 1;

    if (isWithdrawalRestrictionEnabled && userIsEligibleForRestriction && currentUser) {
        const key = `${currentUser.email}_firstDepositDate`;
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
    onAddRequest({ amount: numericAmount, address: selectedAddress.address, type: 'Withdrawal' });
    toast({ title: "Withdrawal Request Submitted", description: `Your request to withdraw ${numericAmount.toFixed(2)} USDT is pending approval.` });
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
                    Your Withdrawal Address
                </Label>
                <div className="flex items-center gap-2">
                   <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger disabled={withdrawalAddresses.length === 0}>
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {withdrawalAddresses.map(addr => (
                          <SelectItem key={addr.id} value={addr.id} disabled={!addr.enabled}>
                            {addr.name} ({addr.type}) - {addr.address.slice(0,6)}...{addr.address.slice(-4)} {!addr.enabled && '(Disabled)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" type="button" onClick={handleAddNewAddress}>
                        <PlusCircle className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
             <div className="flex items-center justify-end gap-2">
                 <Button variant="ghost" size="sm" type="button" onClick={() => handleEditAddress(selectedAddressId)} disabled={!selectedAddressId}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Selected
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" type="button" className="text-destructive hover:text-destructive" disabled={!selectedAddressId}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this saved withdrawal address.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteWithdrawalAddress(selectedAddressId)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
                 <p className="text-xs text-muted-foreground">Max: ${maxWithdrawalAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-md border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin Fee ({withdrawalFeeRate.toFixed(2)}%):</span>
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
            <Button type="submit" className="w-full" disabled={!selectedAddressId}>
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

     <AlertDialog open={isRestrictionAlertOpen} onOpenChange={setIsRestrictionAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Withdrawal Restricted</AlertDialogTitle>
                <AlertDialogDescription>
                   {messages.withdrawal?.restrictionPopup}
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
                <AlertDialogTitle>{messages.withdrawal?.pendingRequestTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                    {messages.withdrawal?.pendingRequestDescription}
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
                <AlertDialogTitle>{messages.withdrawal?.limitReachedTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                    {messages.withdrawal?.limitReachedDescription
                        ?.replace('[X]', monthlyWithdrawalLimit)
                        .replace('[Y]', currentLevel)
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsLimitAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMaxAmountAlertOpen} onOpenChange={setIsMaxAmountAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{messages.withdrawal?.maxAmountTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                    {messages.withdrawal?.maxAmountDescription
                        ?.replace('[Y]', currentLevel)
                        ?.replace('[Amount]', maxWithdrawalAmount.toFixed(2))
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsMaxAmountAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
