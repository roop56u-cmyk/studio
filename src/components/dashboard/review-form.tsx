
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StarRating } from "@/components/dashboard/star-rating";
import { submitReview } from "@/app/actions";
import { generateTaskSuggestion } from "@/app/actions";
import type { GenerateTaskSuggestionOutput } from "@/ai/flows/generate-task-suggestions";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { Label } from "@/components/ui/label";


const reviewSchema = z.object({
  rating: z.number().min(1, "Please provide a rating.").max(5),
  option: z.string({
    required_error: "You need to select a review option.",
  }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    onTaskCompleted?: () => void;
}

export function ReviewForm({ onTaskCompleted }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTask, setIsGeneratingTask] = useState(true);
  const [task, setTask] = useState<GenerateTaskSuggestionOutput | null>(null);
  const { toast } = useToast();
  const { completeTask, tasksCompletedToday, dailyTaskQuota } = useWallet();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const fetchTask = async () => {
    try {
      setIsGeneratingTask(true);
      form.reset();
      const result = await generateTaskSuggestion();
      setTask(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Generating Task",
        description: "Could not fetch an AI-powered task suggestion. Please try again later.",
      });
    } finally {
      setIsGeneratingTask(false);
    }
  };

  useEffect(() => {
    if (tasksCompletedToday < dailyTaskQuota) {
        fetchTask();
    }
  }, [tasksCompletedToday, dailyTaskQuota]);

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

      if (tasksCompletedToday + 1 < dailyTaskQuota) {
          fetchTask();
      } else {
          setTask(null);
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

  if (allTasksCompleted) {
      return (
            <div className="text-center py-8">
                <h3 className="text-lg font-semibold">All Tasks Completed!</h3>
                <p className="text-muted-foreground text-sm mt-1">You have reached your daily limit. Please come back tomorrow for more tasks.</p>
            </div>
      )
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={fetchTask} disabled={isGeneratingTask || allTasksCompleted}>
                <RefreshCw className={cn("h-4 w-4", isGeneratingTask && "animate-spin")} />
                <span className="sr-only">Get new task</span>
            </Button>
        </div>
        <div className="space-y-4">
            <div>
                <FormLabel>Your Task</FormLabel>
                {isGeneratingTask ? (
                    <Skeleton className="h-10 w-full mt-2" />
                ) : (
                    <div className="rounded-md border bg-muted px-3 py-2 text-sm font-semibold min-h-[40px] flex items-center mt-2">
                        {task?.taskTitle || "..."}
                    </div>
                )}
            </div>
            <div>
                <FormLabel>About the Task</FormLabel>
                {isGeneratingTask ? (
                    <Skeleton className="h-8 w-full mt-2" />
                ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                    {task?.taskDescription || "..."}
                    </p>
                )}
            </div>
        </div>
        
        <FormField
        control={form.control}
        name="rating"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Your Rating</FormLabel>
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
              <FormLabel>Select an Option</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  {isGeneratingTask ? (
                     <div className="space-y-2 pt-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-3/5" />
                    </div>
                  ) : (
                    task?.options?.map((option, index) => (
                      <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={option} id={`${field.name}-${index}`} />
                          </FormControl>
                          <Label htmlFor={`${field.name}-${index}`} className="font-normal">
                              {option}
                          </Label>
                      </FormItem>
                    ))
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
        <Button type="submit" disabled={isLoading || isGeneratingTask || !task}>
            {(isLoading || isGeneratingTask) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Submitting..." : "Submit Review"}
        </Button>
        </div>
    </form>
    </Form>
  );
}
