
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StarRating } from "@/components/dashboard/star-rating";
import { submitReview } from "@/app/actions";
import { generateTaskSuggestion } from "@/app/actions";
import type { Task } from "@/lib/tasks";
import { Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please provide a rating.").max(5),
  option: z.string().min(1, { message: "Please select one of the options." }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    onTaskLoaded: (task: Task | null) => void;
    onTaskCompleted?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ onTaskLoaded, onTaskCompleted, onCancel }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTask, setIsGeneratingTask] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const { 
      completeTask, 
      tasksCompletedToday, 
      dailyTaskQuota, 
      taskRewardsBalance,
      taskLevel,
      minRequiredBalanceForLevel 
  } = useWallet();

  const minBalanceForTaskLevel = minRequiredBalanceForLevel(taskLevel);
  const hasSufficientBalance = taskRewardsBalance >= minBalanceForTaskLevel;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      option: "",
    },
  });
  
  useEffect(() => {
    onTaskLoaded(task);
  }, [task, onTaskLoaded]);

  const fetchTask = async () => {
    try {
      setIsGeneratingTask(true);
      form.reset({ rating: 0, option: "" });
      const result = await generateTaskSuggestion();
      setTask(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Generating Task",
        description: "Could not fetch a task from the library. Please try again later.",
      });
       onTaskLoaded(null);
    } finally {
      setIsGeneratingTask(false);
    }
  };

  useEffect(() => {
    if (tasksCompletedToday < dailyTaskQuota && hasSufficientBalance) {
        fetchTask();
    } else {
        setIsGeneratingTask(false);
        setTask(null);
    }
  }, [tasksCompletedToday, dailyTaskQuota, hasSufficientBalance]);

  const onSubmit = async (data: ReviewFormValues) => {
    if (!task) return;
    
    setIsLoading(true);
    try {
      await submitReview({ 
        taskTitle: task.taskTitle,
        rating: data.rating,
        option: data.option,
       });

      completeTask(task);

      if (onTaskCompleted) {
        onTaskCompleted();
      }
      
      const newTasksCompleted = tasksCompletedToday + 1;

      if (newTasksCompleted >= dailyTaskQuota) {
          setTask(null); // All tasks are done
          if (onCancel) onCancel(); // Close dialog if all tasks are done
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit review. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allTasksCompleted = tasksCompletedToday >= dailyTaskQuota;

  if (isGeneratingTask) {
      return (
        <div className="space-y-6">
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
      )
  }
  
  if (!hasSufficientBalance && taskLevel > 0) {
     return (
        <div className="text-center py-8">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Insufficient Balance</h3>
            <p className="text-muted-foreground text-sm mt-1">
                Your Task Rewards balance of ${taskRewardsBalance.toFixed(2)} is below the ${minBalanceForTaskLevel.toLocaleString()} minimum required for Level {taskLevel} tasks.
                Please add more funds to your Task Rewards wallet to continue.
            </p>
            <Button onClick={onCancel} className="mt-4">Close</Button>
        </div>
      )
  }

  if (allTasksCompleted) {
      return (
        <div className="text-center py-8">
            <h3 className="text-lg font-semibold">All Tasks Completed!</h3>
            <p className="text-muted-foreground text-sm mt-1">You have reached your daily limit. Please come back tomorrow for more tasks.</p>
            <Button onClick={onCancel} className="mt-4">Close</Button>
        </div>
      )
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Write a review</h3>
        </div>

        <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Rate your experience</FormLabel>
                    <FormControl>
                        <StarRating rating={field.value} setRating={field.onChange} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="option"
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormControl>
                         <div className="flex flex-wrap gap-2">
                            {task?.options?.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => field.onChange(option)}
                                    className={cn(
                                        "review-option-chip",
                                        field.value === option && "review-option-chip-checked"
                                    )}
                                    data-state={field.value === option ? "checked" : "unchecked"}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                CANCEL
            </Button>
            <Button type="submit" disabled={isLoading || isGeneratingTask || !task}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Submitting..." : "SUBMIT"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
