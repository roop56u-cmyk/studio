
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

const addressSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid BEP20 address."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: WithdrawalAddress | null;
}

export function AddressDialog({ open, onOpenChange, address }: AddressDialogProps) {
  const { addWithdrawalAddress, updateWithdrawalAddress } = useWallet();

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
    if (address) {
      updateWithdrawalAddress({ ...address, ...data });
    } else {
      addWithdrawalAddress(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit" : "Add"} Withdrawal Address</DialogTitle>
          <DialogDescription>
            {address ? "Update the details for your saved address." : "Save a new BEP20 address for withdrawals."}
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
                <Button type="submit">{address ? "Save Changes" : "Add Address"}</Button>
            </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}

