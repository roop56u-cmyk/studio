
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
import { Utensils, ShieldAlert } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import type { Task } from "@/lib/tasks";
import { generateTaskSuggestion } from "@/app/actions";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDialog({ open, onOpenChange }: TaskDialogProps) {
  const { 
    tasksCompletedToday, 
    dailyTaskQuota, 
    earningPerTask, 
    taskRewardsBalance,
    completeTask,
    taskLevel,
    minRequiredBalanceForLevel 
  } = useWallet();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const minBalanceForTaskLevel = minRequiredBalanceForLevel(taskLevel);
  const hasSufficientBalance = taskRewardsBalance >= minBalanceForTaskLevel;
  const allTasksCompleted = tasksCompletedToday >= dailyTaskQuota;

  const fetchTask = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await generateTaskSuggestion();
      setCurrentTask(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Generating Task",
        description: "Could not fetch a task from the library. Please try again later.",
      });
      setCurrentTask(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open && !allTasksCompleted && hasSufficientBalance) {
      fetchTask();
    } else if (!open) {
      setCurrentTask(null);
    }
  }, [open, allTasksCompleted, hasSufficientBalance, fetchTask]);

  const handleReviewSubmit = () => {
    if (!currentTask) return;

    completeTask(currentTask);

    if (tasksCompletedToday + 1 < dailyTaskQuota) {
      fetchTask(); // Fetch the next task
    } else {
      onOpenChange(false); // Close dialog if all tasks are done
    }
  };

  const orderNumber = useMemo(() => `N0${Math.floor(Math.random() * 900000000) + 100000000}`, [currentTask]);
  const orderTime = useMemo(() => format(new Date(), 'dd-MM-yyyy HH:mm:ss'), [currentTask]);
  const orderAmount = taskRewardsBalance;
  const commission = earningPerTask;
  const totalReturns = orderAmount + commission;
  const progressValue = dailyTaskQuota > 0 ? (tasksCompletedToday / dailyTaskQuota) * 100 : 0;

  const backgroundColors = useMemo(() => [
      'bg-yellow-300/80', 'bg-blue-300/80', 'bg-green-300/80',
      'bg-purple-300/80', 'bg-red-300/80', 'bg-indigo-300/80', 'bg-pink-300/80',
  ], []);

  const [headerBg, setHeaderBg] = useState(backgroundColors[0]);

  useEffect(() => {
    if(currentTask) {
        const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
        setHeaderBg(randomColor);
    }
  }, [currentTask, backgroundColors]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2 flex-wrap">
                {[...Array(4)].map((i, idx) => <Skeleton key={idx} className="h-8 w-24 rounded-full" />)}
            </div>
             <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
      );
    }

    if (!hasSufficientBalance && taskLevel > 0) {
      return (
        <div className="text-center py-8 px-6">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Insufficient Balance</h3>
            <p className="text-muted-foreground text-sm mt-1">
                Your Task Rewards balance of ${taskRewardsBalance.toFixed(2)} is below the ${minBalanceForTaskLevel.toLocaleString()} minimum required for Level {taskLevel} tasks.
                Please add more funds to your Task Rewards wallet to continue.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      );
    }

    if (allTasksCompleted) {
      return (
        <div className="text-center py-8 px-6">
            <h3 className="text-lg font-semibold">All Tasks Completed!</h3>
            <p className="text-muted-foreground text-sm mt-1">You have reached your daily limit. Please come back tomorrow for more tasks.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      );
    }

    if (!currentTask) {
       return (
         <div className="text-center py-8 px-6">
            <h3 className="text-lg font-semibold">No Task Available</h3>
            <p className="text-muted-foreground text-sm mt-1">Could not load a task at this time. Please try again later.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
       )
    }
    
    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold">Task Progress</h4>
                    <span className="text-sm text-muted-foreground font-medium">{tasksCompletedToday} / {dailyTaskQuota}</span>
                </div>
                <Progress value={progressValue} className="h-2" />
            </div>
            <ReviewForm 
                task={currentTask}
                onReviewSubmit={handleReviewSubmit}
                onCancel={() => onOpenChange(false)} 
            />
        </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
         <DialogHeader className="sr-only">
          <DialogTitle>Task Review</DialogTitle>
          <DialogDescription>Submit a review for the current task.</DialogDescription>
        </DialogHeader>
        {!isLoading && currentTask && (
             <div className={cn("p-6 rounded-t-lg transition-colors duration-500", headerBg)}>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <Utensils className="h-6 w-6 text-yellow-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{currentTask?.taskTitle ?? "Loading Task..."}</h2>
                <p className="text-sm text-gray-700">{currentTask?.taskDescription ?? "Please wait while we prepare your next task."}</p>

                 <div className="mt-4 bg-black/10 rounded-lg p-4 text-white">
                    <h3 className="text-lg font-semibold text-gray-800">Task Details</h3>
                    <div className="flex justify-between text-xs mt-2 text-gray-700/90">
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
                            <p className="text-xs text-gray-700/90">Base Amount</p>
                            <p className="font-bold text-gray-800">${orderAmount.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-700/90">Commission</p>
                            <p className="font-bold text-gray-800">${commission.toFixed(4)}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-700/90">Total Returns</p>
                            <p className="font-bold text-gray-800">${totalReturns.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
