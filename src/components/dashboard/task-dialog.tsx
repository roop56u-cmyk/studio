
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ReviewForm } from "./review-form";
import { useWallet } from "@/contexts/WalletContext";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDialog({ open, onOpenChange }: TaskDialogProps) {
    const { tasksCompletedToday, dailyTaskQuota } = useWallet();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit a Review</DialogTitle>
           <DialogDescription>
                Tasks Completed Today: {tasksCompletedToday} / {dailyTaskQuota}
           </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ReviewForm onTaskCompleted={() => {
                // If all tasks are now completed, close the dialog.
                if (tasksCompletedToday + 1 >= dailyTaskQuota) {
                    onOpenChange(false);
                }
            }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
