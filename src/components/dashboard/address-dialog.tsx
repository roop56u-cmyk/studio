
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useWallet } from "@/contexts/WalletContext";
import type { WithdrawalAddress } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid BEP20 address."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: WithdrawalAddress | null;
  userEmail?: string; // Optional user email for admin edits
}

export function AddressDialog({ open, onOpenChange, address, userEmail }: AddressDialogProps) {
  const { setWithdrawalAddress: setUserAddress } = useWallet();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: "", address: "" },
  });
  
  useEffect(() => {
    if (address) {
      form.reset({ name: address.name, address: address.address });
    } else {
      form.reset({ name: "", address: "" });
    }
  }, [address, open, form]);


  const onSubmit = (data: AddressFormValues) => {
    const targetEmail = userEmail || currentUser?.email;
    if (!targetEmail) return;

    const newAddress = { ...data, id: `ADDR-${Date.now()}` };
    localStorage.setItem(`${targetEmail}_withdrawalAddress`, JSON.stringify(newAddress));

    if (currentUser?.email === targetEmail) {
        setUserAddress(data);
    }
    
    toast({ title: "Address Saved", description: "The withdrawal address has been updated." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit" : "Set"} Withdrawal Address</DialogTitle>
          <DialogDescription>
            {address ? "Update the details for the saved address." : "Save the BEP20 address for withdrawals."}
            {userEmail && <span className="font-bold block mt-1">Editing for: {userEmail}</span>}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Label / Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">BEP20 Address</Label>
                <Input id="address" {...form.register("address")} placeholder="0x..." />
                {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">{address ? "Save Changes" : "Set Address"}</Button>
            </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
