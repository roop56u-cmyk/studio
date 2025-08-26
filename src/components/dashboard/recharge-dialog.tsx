
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

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RechargeDialog({ open, onOpenChange }: RechargeDialogProps) {
  const { addRequest } = useRequests();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recharge Wallet</DialogTitle>
            <DialogDescription>
              Add funds to your account by submitting a recharge request.
            </DialogDescription>
          </DialogHeader>
          <RechargePanel 
            onAddRequest={addRequest} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

    