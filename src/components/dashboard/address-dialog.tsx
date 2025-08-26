
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
  type: z.string().min(1, "Type is required (e.g., BEP20, TRC20)."),
  address: z.string().min(10, "Address seems too short."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: WithdrawalAddress | null;
  userEmail?: string; // Optional user email for admin edits
}

export function AddressDialog({ open, onOpenChange, address, userEmail }: AddressDialogProps) {
  const { addWithdrawalAddress, updateWithdrawalAddress } = useWallet();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: "", type: "BEP20", address: "" },
  });
  
  useEffect(() => {
    if (address) {
      form.reset({ name: address.name, type: address.type, address: address.address });
    } else {
      form.reset({ name: "", type: "BEP20", address: "" });
    }
  }, [address, open, form]);


  const onSubmit = (data: AddressFormValues) => {
    const targetEmail = userEmail || currentUser?.email;
    if (!targetEmail) return;

    if (address) {
      // Editing existing address
      updateWithdrawalAddress(address.id, data);
      toast({ title: "Address Updated", description: "The withdrawal address has been updated." });
    } else {
      // Adding new address
      addWithdrawalAddress(data);
      toast({ title: "Address Added", description: "The new withdrawal address has been saved." });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit" : "Add"} Withdrawal Address</DialogTitle>
          <DialogDescription>
            {address ? "Update the details for the saved address." : "Save a new address for withdrawals."}
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
                <Label htmlFor="type">Address Type</Label>
                <Input id="type" {...form.register("type")} placeholder="e.g. BEP20, TRC20" />
                {form.formState.errors.type && <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...form.register("address")} placeholder="0x..." />
                {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">{address ? "Save Changes" : "Save Address"}</Button>
            </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}

    