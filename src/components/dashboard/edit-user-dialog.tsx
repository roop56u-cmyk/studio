
"use client";

import { useEffect } from "react";
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
import { useWallet } from "@/contexts/WalletContext"; // Assuming wallet functions are here
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { levels } from "./level-tiers";
import { Switch } from "../ui/switch";

const editUserSchema = z.object({
  referralCode: z.string().min(1, "Referral code is required."),
  level: z.number().min(0).max(5),
  mainBalance: z.number().min(0, "Balance must be non-negative."),
  status: z.enum(['active', 'disabled']),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  // This is a simplified way to update balance. A real app would have a dedicated API.
  const { mainBalance: userBalance } = useWallet(); 

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      referralCode: "",
      level: 0,
      mainBalance: 0,
      status: 'active',
    },
  });

  useEffect(() => {
    if (user) {
      // In a real app, you would fetch this data. We'll use mocked context data for now.
      const taskBalanceKey = `${user.email}_taskRewardsBalance`;
      const interestBalanceKey = `${user.email}_interestEarningsBalance`;
      const taskBalance = parseFloat(localStorage.getItem(taskBalanceKey) || '0');
      const interestBalance = parseFloat(localStorage.getItem(interestBalanceKey) || '0');
      const committedBalance = taskBalance + interestBalance;
      const currentLevel = levels.slice().reverse().find(l => committedBalance >= l.minAmount)?.level ?? 0;
      
      const mainBalanceKey = `${user.email}_mainBalance`;
      const mainBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');

      form.reset({
        referralCode: user.referralCode,
        level: currentLevel,
        mainBalance: mainBalance,
        status: user.status ?? 'active',
      });
    }
  }, [user, open, form]);

  const onSubmit = (data: EditUserFormValues) => {
    if (!user) return;
    
    // Update user's details
    updateUser(user.email, { 
        referralCode: data.referralCode,
        status: data.status,
    });

    // Update user's balance
    const mainBalanceKey = `${user.email}_mainBalance`;
    localStorage.setItem(mainBalanceKey, data.mainBalance.toString());

    // You can't directly set a level, it's derived from balance.
    // To change a level, you'd adjust their committed balance.
    // For this demo, we'll just show the derived level.

    toast({
      title: "User Updated",
      description: `Details for ${user.email} have been successfully updated.`,
    });
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {user.email}</DialogTitle>
          <DialogDescription>
            Modify the user's details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <Input id="referralCode" {...form.register("referralCode")} />
            {form.formState.errors.referralCode && (
              <p className="text-xs text-destructive">{form.formState.errors.referralCode.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainBalance">Main Balance (USDT)</Label>
            <Input id="mainBalance" type="number" {...form.register("mainBalance", { valueAsNumber: true })} />
            {form.formState.errors.mainBalance && (
              <p className="text-xs text-destructive">{form.formState.errors.mainBalance.message}</p>
            )}
          </div>
          <Controller
            name="level"
            control={form.control}
            render={({ field }) => (
                <div className="space-y-2">
                    <Label>User Level</Label>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)} disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                            {levels.map(l => <SelectItem key={l.level} value={String(l.level)}>Level {l.level}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Level is derived from committed funds and cannot be set directly.</p>
                </div>
            )}
          />
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
  );
}
