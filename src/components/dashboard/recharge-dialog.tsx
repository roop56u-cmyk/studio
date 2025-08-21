
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RechargePanel } from "@/components/dashboard/recharge-panel";
import { useWallet } from "@/contexts/WalletContext";
import { useRequests } from "@/contexts/RequestContext";

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RechargeDialog({ open, onOpenChange }: RechargeDialogProps) {
  const { addRecharge } = useWallet();
  const { addRequest } = useRequests();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recharge Wallet</DialogTitle>
          <DialogDescription>
            Add USDT (BEP20) to your account by submitting a recharge request.
          </DialogDescription>
        </DialogHeader>
        <RechargePanel onRecharge={addRecharge} onAddRequest={addRequest} />
      </DialogContent>
    </Dialog>
  );
}
