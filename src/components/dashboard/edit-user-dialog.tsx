
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { levels } from "./level-tiers";
import { AddressDialog } from "./address-dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const editUserSchema = z.object({
  email: z.string().email("Invalid email address."),
  referralCode: z.string().min(1, "Referral code is required."),
  referredBy: z.string().optional(),
  overrideLevel: z.number().min(0).max(5),
  mainBalance: z.number().min(0, "Balance must be non-negative."),
  taskRewardsBalance: z.number().min(0, "Balance must be non-negative."),
  interestEarningsBalance: z.number().min(0, "Balance must be non-negative."),
  purchasedReferrals: z.number().min(0, "Referrals must be non-negative."),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user: userProp }: EditUserDialogProps) {
  const { updateUser, users } = useAuth();
  const { toast } = useToast();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [restrictionDays, setRestrictionDays] = useState(45);
  const [currentUserData, setCurrentUserData] = useState<User | null>(userProp);

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

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: "",
      referralCode: "",
      referredBy: "",
      overrideLevel: 0,
      mainBalance: 0,
      taskRewardsBalance: 0,
      interestEarningsBalance: 0,
      purchasedReferrals: 0,
    },
  });

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
    if (currentUserData && open) {
      const mainBalance = getInitialState('mainBalance', 0, currentUserData.email);
      const taskRewardsBalance = getInitialState('taskRewardsBalance', 0, currentUserData.email);
      const interestEarningsBalance = getInitialState('interestEarningsBalance', 0, currentUserData.email);
      const purchasedReferrals = getInitialState('purchased_referrals', 0, currentUserData.email);
      const committedBalance = taskRewardsBalance + interestEarningsBalance;
      
      const directReferrals = users.filter(u => u.referredBy === currentUserData.referralCode).length;
      const autoLevel = levels.slice().reverse().find(l => {
          const balanceMet = committedBalance >= l.minAmount;
          const referralsMet = directReferrals >= l.referrals;
          return balanceMet && referralsMet;
      })?.level ?? 0;

      form.reset({
        email: currentUserData.email,
        referralCode: currentUserData.referralCode,
        referredBy: currentUserData.referredBy ?? "",
        overrideLevel: currentUserData.overrideLevel ?? autoLevel,
        mainBalance: mainBalance,
        taskRewardsBalance: taskRewardsBalance,
        interestEarningsBalance: interestEarningsBalance,
        purchasedReferrals: purchasedReferrals,
      });
    }
  }, [currentUserData, open, form, users]);

  const onSubmit = (data: EditUserFormValues) => {
    if (!currentUserData) return;

    if(data.referredBy && !users.some(u => u.referralCode === data.referredBy)) {
        toast({ title: "Invalid Referrer", description: "The 'Referred By' code does not exist.", variant: "destructive"});
        return;
    }

    const updatedUser: Partial<User> = {
        ...currentUserData,
        ...data,
        referredBy: data.referredBy || null,
        overrideLevel: data.overrideLevel,
    };
    
    updateUser(currentUserData.email, updatedUser);
    
    toast({
      title: "User Updated",
      description: `Details for ${currentUserData.email} have been successfully updated.`,
    });
    onOpenChange(false);
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
          <DialogTitle>Edit User: {currentUserData.email}</DialogTitle>
          <DialogDescription>
            Modify the user's details below. Changes are saved directly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>User Status</Label>
            <div>
                 <Badge variant={currentUserData.status === 'active' ? 'default' : 'destructive'} className={currentUserData.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}>
                    {currentUserData.status}
                </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <Input id="referralCode" {...form.register("referralCode")} />
            {form.formState.errors.referralCode && (
              <p className="text-xs text-destructive">{form.formState.errors.referralCode.message}</p>
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="referredBy">Referred By (Code)</Label>
            <Input id="referredBy" {...form.register("referredBy")} />
            {form.formState.errors.referredBy && (
              <p className="text-xs text-destructive">{form.formState.errors.referredBy.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="mainBalance">Main Balance</Label>
                <Input id="mainBalance" type="number" {...form.register("mainBalance", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskRewardsBalance">Task Rewards Bal</Label>
                <Input id="taskRewardsBalance" type="number" {...form.register("taskRewardsBalance", { valueAsNumber: true })} />
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                    <Label htmlFor="interestEarningsBalance">Interest Earnings Bal</Label>
                    <Input id="interestEarningsBalance" type="number" {...form.register("interestEarningsBalance", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="purchasedReferrals">Bonus Referrals</Label>
                    <Input id="purchasedReferrals" type="number" {...form.register("purchasedReferrals", { valueAsNumber: true })} />
                </div>
          </div>
        
          <Controller
            name="overrideLevel"
            control={form.control}
            render={({ field }) => (
                <div className="space-y-2">
                    <Label>User Level (Manual Override)</Label>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                            {levels.map(l => <SelectItem key={l.level} value={String(l.level)}>Level {l.level}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <p className="text-xs text-muted-foreground">Allows you to manually set the user's level.</p>
                </div>
            )}
          />

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
                    referredUsers.map(refUser => (
                        <div key={refUser.email} className="text-sm text-muted-foreground flex justify-between items-center">
                           <span>{refUser.email}</span>
                           <Badge variant="secondary">Lvl {getInitialState('level', 0, refUser.email)}</Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-center text-muted-foreground py-2">This user has not referred anyone yet.</p>
                )}
            </div>
          </div>

          <Separator />
          
          <div className="space-y-3 rounded-md border border-amber-500/50 p-3">
             <h4 className="font-semibold text-amber-700">Custom Withdrawal Restriction</h4>
             {isRestricted ? (
                 <p className="text-sm text-muted-foreground">
                    This user is restricted until: <br/>
                    <strong className="text-foreground">{new Date(currentUserData.withdrawalRestrictionUntil!).toLocaleString()}</strong>
                 </p>
             ) : (
                 <p className="text-sm text-muted-foreground">No custom restriction is active. Global settings apply.</p>
             )}
             <div className="space-y-2">
                 <Label htmlFor="restriction-days">Set Restriction (Days from now)</Label>
                 <Input id="restriction-days" type="number" value={restrictionDays} onChange={e => setRestrictionDays(Number(e.target.value))} />
             </div>
             <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleApplyRestriction}>Apply Restriction</Button>
                <Button type="button" variant="destructive" size="sm" onClick={handleRemoveRestriction} disabled={!isRestricted}>Remove Restriction</Button>
             </div>
          </div>


          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
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
