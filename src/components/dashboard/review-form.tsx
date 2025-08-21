"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/dashboard/star-rating";
import { SentimentResult } from "@/components/dashboard/sentiment-result";
import { submitReview } from "@/app/actions";
import type { AnalyzeReviewSentimentOutput } from "@/ai/flows/analyze-review-sentiment";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  category: z.string({ required_error: "Please select a category." }),
  rating: z.number().min(1, "Please provide a rating.").max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters.").max(1000),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sentiment, setSentiment] = useState<AnalyzeReviewSentimentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      reviewText: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    setSentiment(null);
    try {
      const result = await submitReview({ reviewText: data.reviewText });
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
          Rate and review a service. We&apos;ll analyze its sentiment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hotel">Hotels</SelectItem>
                        <SelectItem value="hospital">Hospitals</SelectItem>
                        <SelectItem value="restaurant">Restaurants</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

            <FormField
              control={form.control}
              name="reviewText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience in detail..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
