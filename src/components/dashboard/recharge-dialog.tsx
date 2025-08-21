
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RechargePanel } from "@/components/dashboard/recharge-panel";
import { useRequests } from "@/contexts/RequestContext";
import { AddressDialog } from "./address-dialog";


interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RechargeDialog({ open, onOpenChange }: RechargeDialogProps) {
  const { addRequest } = useRequests();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recharge Wallet</DialogTitle>
            <DialogDescription>
              Add USDT (BEP20) to your account by submitting a recharge request.
            </DialogDescription>
          </DialogHeader>
          <RechargePanel 
            onAddRequest={addRequest} 
            onManageAddresses={() => {
              onOpenChange(false); // Close recharge dialog
              setIsAddressDialogOpen(true); // Open manage address dialog
            }}
          />
        </DialogContent>
      </Dialog>
      <AddressDialog 
        open={isAddressDialogOpen} 
        onOpenChange={setIsAddressDialogOpen} 
        address={null} 
      />
    </>
  );
}
