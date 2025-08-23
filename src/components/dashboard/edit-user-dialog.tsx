
"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "../ui/switch";
import { useWallet } from "@/contexts/WalletContext";
import { AddressDialog } from "./address-dialog";

const editUserSchema = z.object({
  email: z.string().email("Invalid email address."),
  referralCode: z.string().min(1, "Referral code is required."),
  referredBy: z.string().optional(),
  overrideLevel: z.number().min(0).max(5),
  mainBalance: z.number().min(0, "Balance must be non-negative."),
  taskRewardsBalance: z.number().min(0, "Balance must be non-negative."),
  interestEarningsBalance: z.number().min(0, "Balance must be non-negative."),
  status: z.enum(['active', 'disabled']),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { updateUser, users } = useAuth();
  const { toast } = useToast();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  
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
      status: 'active',
    },
  });

  useEffect(() => {
    if (user && open) {
      const mainBalance = getInitialState('mainBalance', 0, user.email);
      const taskRewardsBalance = getInitialState('taskRewardsBalance', 0, user.email);
      const interestEarningsBalance = getInitialState('interestEarningsBalance', 0, user.email);
      const committedBalance = taskRewardsBalance + interestEarningsBalance;
      
      const directReferrals = users.filter(u => u.referredBy === user.referralCode).length;
      const autoLevel = levels.slice().reverse().find(l => {
          const balanceMet = committedBalance >= l.minAmount;
          const referralsMet = directReferrals >= l.referrals;
          return balanceMet && referralsMet;
      })?.level ?? 0;

      form.reset({
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy ?? "",
        overrideLevel: user.overrideLevel ?? autoLevel,
        mainBalance: mainBalance,
        taskRewardsBalance: taskRewardsBalance,
        interestEarningsBalance: interestEarningsBalance,
        status: user.status ?? 'active',
      });
    }
  }, [user, open, form, users]);

  const onSubmit = (data: EditUserFormValues) => {
    if (!user) return;

    // Check if the new referral code is valid (if changed)
    if(data.referredBy && !users.some(u => u.referralCode === data.referredBy)) {
        toast({ title: "Invalid Referrer", description: "The 'Referred By' code does not exist.", variant: "destructive"});
        return;
    }

    updateUser(user.email, { 
        ...data,
        referredBy: data.referredBy || null,
        overrideLevel: data.overrideLevel,
    });
    
    toast({
      title: "User Updated",
      description: `Details for ${user.email} have been successfully updated.`,
    });
    onOpenChange(false);
  };

  if (!user) return null;
  
  const userWithdrawalAddress = getInitialState('withdrawalAddress', null, user.email);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {user.email}</DialogTitle>
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
          <div className="space-y-2">
                <Label htmlFor="interestEarningsBalance">Interest Earnings Bal</Label>
                <Input id="interestEarningsBalance" type="number" {...form.register("interestEarningsBalance", { valueAsNumber: true })} />
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
           
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label>User Status</Label>
                  <DialogDescription>
                    {field.value === 'active' ? 'User can log in.' : 'User is disabled and cannot log in.'}
                  </DialogDescription>
                </div>
                <Switch
                  checked={field.value === 'active'}
                  onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'disabled')}
                />
              </div>
            )}
          />


          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    {user && (
        <AddressDialog 
            open={isAddressDialogOpen}
            onOpenChange={setIsAddressDialogOpen}
            address={userWithdrawalAddress}
            userEmail={user.email}
        />
    )}
    </>
  );
}
