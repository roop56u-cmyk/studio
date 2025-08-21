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
import { StarRating } from "@/components/dashboard/star-rating";
import { SentimentResult } from "@/components/dashboard/sentiment-result";
import { submitReview } from "@/app/actions";
import type { AnalyzeReviewSentimentOutput } from "@/ai/flows/analyze-review-sentiment";
import { generateTaskSuggestion } from "@/app/actions";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please provide a rating.").max(5),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTask, setIsGeneratingTask] = useState(true);
  const [task, setTask] = useState<string>("");
  const [sentiment, setSentiment] = useState<AnalyzeReviewSentimentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const fetchTask = async () => {
    try {
      setIsGeneratingTask(true);
      setSentiment(null);
      form.reset();
      const { task } = await generateTaskSuggestion();
      setTask(task);
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
    fetchTask();
  }, []);

  const onSubmit = async (data: ReviewFormValues) => {
    if (!task) return;
    setIsLoading(true);
    setSentiment(null);
    try {
      const result = await submitReview({ reviewText: task });
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
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Submit a Review</CardTitle>
                <CardDescription>
                Rate the task below. We&apos;ll analyze its sentiment for you.
                </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchTask} disabled={isGeneratingTask}>
                <RefreshCw className={cn("h-4 w-4", isGeneratingTask && "animate-spin")} />
                <span className="sr-only">Get new task</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label>Your Task to Review</Label>
                {isGeneratingTask ? (
                     <Skeleton className="h-24 w-full" />
                ) : (
                    <Textarea
                        readOnly
                        value={task}
                        className="h-24 resize-none bg-muted"
                        placeholder="Generating a task for you..."
                    />
                )}
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

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isLoading || isGeneratingTask || !task}>
                {(isLoading || isGeneratingTask) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
