
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ReviewForm } from "./review-form";
import { useWallet } from "@/contexts/WalletContext";
import { Utensils, X } from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { Task } from "@/lib/tasks";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDialog({ open, onOpenChange }: TaskDialogProps) {
    const { tasksCompletedToday, dailyTaskQuota, earningPerTask, taskRewardsBalance } = useWallet();
    const [currentTask, setCurrentTask] = useState<Task | null>(null);

    const orderNumber = useMemo(() => `N0${Math.floor(Math.random() * 900000000) + 100000000}`, [currentTask]);
    const orderTime = useMemo(() => format(new Date(), 'dd-MM-yyyy HH:mm:ss'), [currentTask]);
    const orderAmount = taskRewardsBalance;
    const commission = earningPerTask;
    const totalReturns = orderAmount + commission;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Task Review</DialogTitle>
          <DialogDescription>Submit a review for the current task.</DialogDescription>
        </DialogHeader>
         <div className="bg-yellow-300/80 p-6 rounded-t-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-yellow-500" />
                </div>
                 <DialogClose asChild>
                    <button className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center text-white">
                        <X className="h-5 w-5" />
                    </button>
                </DialogClose>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{currentTask?.taskTitle ?? "Loading Task..."}</h2>
            <p className="text-sm text-gray-700">{currentTask?.taskDescription ?? "Please wait while we prepare your next task."}</p>

             <div className="mt-4 bg-yellow-600/20 rounded-lg p-4 text-white">
                <h3 className="text-lg font-semibold text-gray-800">Task Details</h3>
                <div className="flex justify-between text-xs mt-2 text-gray-700">
                    <p>Order number:</p>
                    <p>Order time:</p>
                </div>
                 <div className="flex justify-between text-xs font-mono text-gray-800">
                    <p>{orderNumber}</p>
                    <p>{orderTime}</p>
                </div>
                <div className="border-t border-dashed border-gray-600/50 my-3"></div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xs text-gray-700">Base Amount</p>
                        <p className="font-bold text-gray-800">${orderAmount.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-700">Commission</p>
                        <p className="font-bold text-gray-800">${commission.toFixed(4)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-700">Total Returns</p>
                        <p className="font-bold text-gray-800">${totalReturns.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6">
            <ReviewForm 
                onTaskLoaded={setCurrentTask}
                onTaskCompleted={() => {
                    // Keep dialog open if there are more tasks
                    if (tasksCompletedToday + 1 >= dailyTaskQuota) {
                        onOpenChange(false);
                    }
                }} 
                onCancel={() => onOpenChange(false)} 
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
