"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { SentimentResult } from "@/components/dashboard/sentiment-result";
import { submitReview } from "@/app/actions";
import type { AnalyzeReviewSentimentOutput } from "@/ai/flows/analyze-review-sentiment";
import { generateTaskSuggestions } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";

const reviewSchema = z.object({
  task: z.string({ required_error: "Please select a task." }),
  rating: z.number().min(1, "Please provide a rating.").max(5),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(true);
  const [taskSuggestions, setTaskSuggestions] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<AnalyzeReviewSentimentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const selectedTask = form.watch("task");

  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsGeneratingTasks(true);
        const { tasks } = await generateTaskSuggestions();
        setTaskSuggestions(tasks);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Generating Tasks",
          description: "Could not fetch AI-powered task suggestions. Please try again later.",
        });
      } finally {
        setIsGeneratingTasks(false);
      }
    }
    fetchTasks();
  }, [toast]);

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    setSentiment(null);
    try {
      // Use the selected task content as the review text
      const result = await submitReview({ reviewText: data.task });
      if (result) {
        setSentiment(result);
        toast({
            title: "Review Analyzed!",
            description: "We've successfully analyzed the sentiment of your review.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze review. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Review</CardTitle>
        <CardDescription>
          Select a task and rate it. We&apos;ll analyze its sentiment for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select a Task to Review</FormLabel>
                   {isGeneratingTasks ? (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                   ) : (
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        {taskSuggestions.map((task, index) => (
                            <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={task} />
                                </FormControl>
                                <Label className="font-normal">{task}</Label>
                            </FormItem>
                        ))}
                        </RadioGroup>
                    </FormControl>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTask && (
                <div className="space-y-2">
                    <Label>Selected Task Content</Label>
                    <Textarea
                        readOnly
                        value={selectedTask}
                        className="h-24 resize-none bg-muted"
                    />
                </div>
            )}
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRating rating={field.value} setRating={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isLoading || isGeneratingTasks}>
                {(isLoading || isGeneratingTasks) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Analyzing..." : "Submit and Analyze"}
              </Button>
              {sentiment && !isLoading && (
                <SentimentResult sentiment={sentiment.sentiment} confidence={sentiment.confidence} />
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
