
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { levels as defaultLevels, Level } from "./level-tiers";
import { AddressDialog } from "./address-dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user: userProp }: EditUserDialogProps) {
  const { updateUser, users } = useAuth();
  const { toast } = useToast();
  const [currentUserData, setCurrentUserData] = useState<User | null>(userProp);
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);


  // State for each editable field
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [overrideLevel, setOverrideLevel] = useState(0);
  const [mainBalance, setMainBalance] = useState("0");
  const [taskRewardsBalance, setTaskRewardsBalance] = useState("0");
  const [interestEarningsBalance, setInterestEarningsBalance] = useState("0");
  const [purchasedReferrals, setPurchasedReferrals] = useState("0");

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [restrictionDays, setRestrictionDays] = useState(45);
  
  const getInitialState = (key: string, defaultValue: any, userEmail?: string) => {
    if (typeof window === 'undefined' || !userEmail) return defaultValue;
    try {
      const storedValue = localStorage.getItem(`${userEmail}_${key}`);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Failed to parse ${key} from localStorage`, error);
      return defaultValue;
    }
  };

  const referredUsers = useMemo(() => {
      if (!currentUserData) return [];
      return users.filter(u => u.referredBy === currentUserData.referralCode);
  }, [currentUserData, users]);

  useEffect(() => {
    if (userProp) {
      setCurrentUserData(userProp);
    }
  }, [userProp, open]);

  useEffect(() => {
    const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        setAvailableLevels(JSON.parse(storedLevels));
    }
  }, [open]);

  useEffect(() => {
    if (currentUserData && open) {
      const initialMainBalance = getInitialState('mainBalance', 0, currentUserData.email);
      const initialTaskRewardsBalance = getInitialState('taskRewardsBalance', 0, currentUserData.email);
      const initialInterestEarningsBalance = getInitialState('interestEarningsBalance', 0, currentUserData.email);
      const initialPurchasedReferrals = getInitialState('purchased_referrals', 0, currentUserData.email);
      const committedBalance = initialTaskRewardsBalance + initialInterestEarningsBalance;
      
      const directReferrals = users.filter(u => u.referredBy === currentUserData.referralCode).length;
      
      const autoLevel = availableLevels.slice().reverse().find(l => {
          if (l.level === 0) return false;
          const balanceMet = committedBalance >= l.minAmount;
          const referralsMet = directReferrals >= l.referrals;
          return balanceMet && referralsMet;
      })?.level ?? 0;
      
      // Set individual states
      setEmail(currentUserData.email);
      setReferralCode(currentUserData.referralCode);
      setReferredBy(currentUserData.referredBy || "");
      setOverrideLevel(currentUserData.overrideLevel ?? autoLevel);
      setMainBalance(String(initialMainBalance));
      setTaskRewardsBalance(String(initialTaskRewardsBalance));
      setInterestEarningsBalance(String(initialInterestEarningsBalance));
      setPurchasedReferrals(String(initialPurchasedReferrals));

    }
  }, [currentUserData, open, users, availableLevels]);
  
  const handleSaveCoreInfo = () => {
    if (!currentUserData) return;
    if(referredBy && !users.some(u => u.referralCode === referredBy)) {
        toast({ title: "Invalid Referrer", description: "The 'Referred By' code does not exist.", variant: "destructive"});
        return;
    }
    updateUser(currentUserData.email, { email, referralCode, referredBy: referredBy || null });
    toast({ title: "Core Info Updated", description: "User's core details have been saved." });
     // If email changed, we need to update the key for our state
    if (email !== currentUserData.email) {
       setCurrentUserData(prev => prev ? { ...prev, email } : null);
    }
  };

  const handleSaveBalances = () => {
    if (!currentUserData) return;
    const balances = {
        mainBalance: parseFloat(mainBalance),
        taskRewardsBalance: parseFloat(taskRewardsBalance),
        interestEarningsBalance: parseFloat(interestEarningsBalance),
        purchasedReferrals: parseInt(purchasedReferrals, 10),
    };
    updateUser(currentUserData.email, balances);
    toast({ title: "Balances Updated", description: "User's wallet balances have been saved." });
  };
  
  const handleSetLevel = () => {
    if (!currentUserData) return;
    updateUser(currentUserData.email, { overrideLevel });
    toast({ title: "Level Overridden", description: `User's level has been manually set to ${overrideLevel}.` });
  };
  
  const handleApplyRestriction = () => {
    if (!currentUserData || restrictionDays <= 0) return;
    const newRestrictionDate = new Date();
    newRestrictionDate.setDate(newRestrictionDate.getDate() + restrictionDays);
    
    const updatedUser = { ...currentUserData, withdrawalRestrictionUntil: newRestrictionDate.toISOString() };
    updateUser(currentUserData.email, updatedUser);
    setCurrentUserData(updatedUser);
    toast({ title: "Restriction Applied", description: `User is restricted from withdrawals for ${restrictionDays} days.` });
  };
  
  const handleRemoveRestriction = () => {
    if (!currentUserData) return;
    const updatedUser = { ...currentUserData, withdrawalRestrictionUntil: null };
    updateUser(currentUserData.email, updatedUser);
    setCurrentUserData(updatedUser);
    toast({ title: "Restriction Removed", description: `User's custom withdrawal restriction has been removed.` });
  };


  if (!currentUserData) return null;
  
  const userWithdrawalAddress = getInitialState('withdrawalAddress', null, currentUserData.email);
  const isRestricted = currentUserData.withdrawalRestrictionUntil && new Date(currentUserData.withdrawalRestrictionUntil) > new Date();

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {currentUserData.fullName}</DialogTitle>
          <DialogDescription>
            Modify user details below. Each section has its own save button.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
           {/* --- Core Info Section --- */}
          <div className="space-y-4 p-3 border rounded-lg">
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input id="referralCode" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="referredBy">Referred By (Code)</Label>
                <Input id="referredBy" value={referredBy} onChange={e => setReferredBy(e.target.value)} />
            </div>
            <Button onClick={handleSaveCoreInfo} size="sm">Save Info</Button>
          </div>

          {/* --- Balances Section --- */}
          <div className="space-y-4 p-3 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mainBalance">Main Balance</Label>
                    <Input id="mainBalance" type="number" value={mainBalance} onChange={e => setMainBalance(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="taskRewardsBalance">Task Rewards Bal</Label>
                    <Input id="taskRewardsBalance" type="number" value={taskRewardsBalance} onChange={e => setTaskRewardsBalance(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                        <Label htmlFor="interestEarningsBalance">Interest Earnings Bal</Label>
                        <Input id="interestEarningsBalance" type="number" value={interestEarningsBalance} onChange={e => setInterestEarningsBalance(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="purchasedReferrals">Bonus Referrals</Label>
                        <Input id="purchasedReferrals" type="number" value={purchasedReferrals} onChange={e => setPurchasedReferrals(e.target.value)} />
                    </div>
            </div>
            <Button onClick={handleSaveBalances} size="sm">Save Balances</Button>
          </div>
          
           {/* --- Level Section --- */}
          <div className="space-y-4 p-3 border rounded-lg">
               <div className="space-y-2">
                    <Label>User Level (Manual Override)</Label>
                    <Select onValueChange={(value) => setOverrideLevel(Number(value))} value={String(overrideLevel)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableLevels.map(l => <SelectItem key={l.level} value={String(l.level)}>Level {l.level}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <p className="text-xs text-muted-foreground">Allows you to manually set the user's level.</p>
                </div>
                <Button onClick={handleSetLevel} size="sm">Set Level</Button>
          </div>
          
          {/* --- Other Sections --- */}
          <div className="space-y-2">
            <Label>User Status</Label>
            <div><Badge variant={currentUserData.status === 'active' ? 'default' : 'destructive'} className={currentUserData.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}>{currentUserData.status}</Badge></div>
          </div>
          <div className="space-y-2">
            <Label>Withdrawal Address</Label>
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsAddressDialogOpen(true)}>
                {userWithdrawalAddress ? 'Edit Withdrawal Address' : 'Set Withdrawal Address'}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Referred Users ({referredUsers.length})</Label>
            <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                {referredUsers.length > 0 ? (
                    referredUsers.map(refUser => (<div key={refUser.email} className="text-sm text-muted-foreground flex justify-between items-center"><span>{refUser.email}</span><Badge variant="secondary">Lvl {getInitialState('level', 0, refUser.email)}</Badge></div>))
                ) : (<p className="text-xs text-center text-muted-foreground py-2">This user has not referred anyone yet.</p>)}
            </div>
          </div>
          <Separator />
          <div className="space-y-3 rounded-md border border-amber-500/50 p-3">
             <h4 className="font-semibold text-amber-700">Custom Withdrawal Restriction</h4>
             {isRestricted ? (<p className="text-sm text-muted-foreground">This user is restricted until: <br/><strong className="text-foreground">{new Date(currentUserData.withdrawalRestrictionUntil!).toLocaleString()}</strong></p>) : (<p className="text-sm text-muted-foreground">No custom restriction is active. Global settings apply.</p>)}
             <div className="space-y-2">
                 <Label htmlFor="restriction-days">Set Restriction (Days from now)</Label>
                 <Input id="restriction-days" type="number" value={restrictionDays} onChange={e => setRestrictionDays(Number(e.target.value))} />
             </div>
             <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleApplyRestriction}>Apply Restriction</Button>
                <Button type="button" variant="destructive" size="sm" onClick={handleRemoveRestriction} disabled={!isRestricted}>Remove</Button>
             </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {currentUserData && (
        <AddressDialog 
            open={isAddressDialogOpen}
            onOpenChange={setIsAddressDialogOpen}
            address={userWithdrawalAddress}
            userEmail={currentUserData.email}
        />
    )}
    </>
  );
}
