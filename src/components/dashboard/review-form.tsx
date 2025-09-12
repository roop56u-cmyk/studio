
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
import type { Task } from "@/lib/tasks";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please provide a rating.").max(5),
  option: z.string().min(1, { message: "Please select one of the options." }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    task: Task;
    onReviewSubmit: () => void;
    onCancel: () => void;
}

export function ReviewForm({ task, onReviewSubmit, onCancel }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      option: "",
    },
  });
  
  useEffect(() => {
    // Reset form when a new task is passed in
    form.reset({ rating: 0, option: "" });
  }, [task, form]);


  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    try {
      await submitReview({ 
        taskTitle: task.taskTitle,
        rating: data.rating,
        option: data.option,
       });

      onReviewSubmit();

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
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Submitting..." : "SUBMIT"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
