
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WithdrawalPanel } from "@/components/dashboard/withdrawal-panel";
import { useRequests } from "@/contexts/RequestContext";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalDialog({ open, onOpenChange }: WithdrawalDialogProps) {
    const { addRequest } = useRequests();

    const handleAddRequest = (requestData: Omit<any, 'id' | 'date' | 'user' | 'status'>) => {
        addRequest({
            ...requestData,
            type: "Withdrawal",
        });
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Withdraw USDT (BEP20) from your account. Admin fees apply.
          </DialogDescription>
        </DialogHeader>
        <WithdrawalPanel onAddRequest={handleAddRequest} />
      </DialogContent>
    </Dialog>
  );
}
