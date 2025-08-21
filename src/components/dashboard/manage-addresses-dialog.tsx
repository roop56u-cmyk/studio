
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import type { WithdrawalAddress } from "@/contexts/WalletContext";
import { Trash2, Edit, PlusCircle } from "lucide-react";
import { Separator } from "../ui/separator";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid BEP20 address."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface ManageAddressesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageAddressesDialog({ open, onOpenChange }: ManageAddressesDialogProps) {
  const { withdrawalAddresses, addWithdrawalAddress, updateWithdrawalAddress, deleteWithdrawalAddress } = useWallet();
  const [editingAddress, setEditingAddress] = useState<WithdrawalAddress | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: "", address: "" },
  });

  const handleOpenForm = (address: WithdrawalAddress | null) => {
    setEditingAddress(address);
    form.reset(address ? { name: address.name, address: address.address } : { name: "", address: "" });
  };

  const onSubmit = (data: AddressFormValues) => {
    if (editingAddress) {
      updateWithdrawalAddress({ ...editingAddress, ...data });
    } else {
      addWithdrawalAddress(data);
    }
    setEditingAddress(null);
    form.reset({ name: "", address: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Withdrawal Addresses</DialogTitle>
          <DialogDescription>Add, edit, or remove your saved BEP20 addresses.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {editingAddress !== null || withdrawalAddresses.length === 0 ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
              <h4 className="font-medium">{editingAddress ? "Edit Address" : "Add New Address"}</h4>
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingAddress(null)}>Cancel</Button>
                <Button type="submit">{editingAddress ? "Save Changes" : "Add Address"}</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
              </Button>
              <Separator />
               <p className="text-sm text-muted-foreground text-center">Your saved addresses:</p>
            </div>
          )}

          {withdrawalAddresses.length > 0 && editingAddress === null && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {withdrawalAddresses.map(addr => (
                <div key={addr.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <p className="font-medium text-sm">{addr.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{addr.address.slice(0, 10)}...{addr.address.slice(-8)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(addr)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the address "{addr.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteWithdrawalAddress(addr.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
