
"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import type { Request } from "@/contexts/RequestContext";
import type { RechargeAddress } from "@/app/dashboard/admin/recharge-addresses/page";
import { ScrollArea } from "../ui/scroll-area";
import { platformMessages } from "@/lib/platform-messages";

interface RechargePanelProps {
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


export function RechargePanel({ onAddRequest }: RechargePanelProps) {
  const { toast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { withdrawalAddresses } = useWallet();
  const [rechargeAddresses, setRechargeAddresses] = useState<RechargeAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<RechargeAddress | null>(null);
  const [messages, setMessages] = useState<any>({});


  const [isAddressAlertOpen, setIsAddressAlertOpen] = useState(false);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);
  
  useEffect(() => {
    const savedAddresses = localStorage.getItem('system_recharge_addresses');
    if (savedAddresses) {
        const enabledAddresses = JSON.parse(savedAddresses).filter((a: RechargeAddress) => a.enabled);
        setRechargeAddresses(enabledAddresses);
    }

    const storedMessages = getGlobalSetting("platform_custom_messages", {}, true);
    const defaults: any = {};
    Object.entries(platformMessages).forEach(([catKey, category]) => {
      defaults[catKey] = {};
      Object.entries(category.messages).forEach(([msgKey, msgItem]) => {
        defaults[catKey][msgKey] = msgItem.defaultValue;
      });
    });

    const mergedMessages = {
      withdrawal: { ...defaults.withdrawal, ...(storedMessages.withdrawal || {}) },
      recharge: { ...defaults.recharge, ...(storedMessages.recharge || {}) }
    };
    setMessages(mergedMessages);

  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast({
      title: "Address Copied!",
      description: "The address has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const proceedWithSubmit = () => {
     const numericAmount = parseFloat(amount);
     onAddRequest({
        type: 'Recharge',
        amount: numericAmount,
        address: null, 
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

    if (!selectedAddress) {
       toast({
            variant: "destructive",
            title: "No Address Selected",
            description: "Please select a recharge address to send funds to.",
        });
        return;
    }
    
    if (withdrawalAddresses.length === 0) {
        setIsAddressAlertOpen(true);
        return;
    }

    setIsConfirmAlertOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recharge Funds</CardTitle>
          <CardDescription>
            Select an address, send funds, then submit your request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="space-y-2">
                  <Label>1. Choose an Official Address</Label>
                   <ScrollArea className="h-48 rounded-md border p-2">
                        <div className="space-y-2">
                        {rechargeAddresses.length > 0 ? rechargeAddresses.map(addr => (
                             <div 
                                key={addr.id} 
                                onClick={() => setSelectedAddress(addr)}
                                className={`p-3 border rounded-lg cursor-pointer ${selectedAddress?.id === addr.id ? 'ring-2 ring-primary border-primary' : ''}`}
                             >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{addr.name}</span>
                                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{addr.type}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono mt-1 break-all">{addr.address}</p>
                                    </div>
                                    <Button variant="outline" size="icon" type="button" onClick={(e) => { e.stopPropagation(); handleCopy(addr.address); }}>
                                        {copiedAddress === addr.address ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                             </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No recharge addresses are available. Please contact support.</p>
                        )}
                        </div>
                   </ScrollArea>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="amount">2. Enter Recharge Amount (USDT)</Label>
                  <Input 
                      id="amount" 
                      type="number" 
                      placeholder="100.00" 
                      required 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                  />
              </div>
              <Button type="submit" className="w-full">3. Submit Recharge Request</Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={isAddressAlertOpen} onOpenChange={setIsAddressAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{messages.recharge?.addressRequiredTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {messages.recharge?.addressRequiredDescription}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setIsAddressAlertOpen(false)}>OK</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmAlertOpen} onOpenChange={setIsConfirmAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{messages.recharge?.confirmDepositTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {messages.recharge?.confirmDepositDescription?.replace('[Amount]', amount ? `$${amount}` : 'your funds')}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={proceedWithSubmit}>Confirm & Submit</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
