"use server";

import { analyzeReviewSentiment, AnalyzeReviewSentimentInput, AnalyzeReviewSentimentOutput } from "@/ai/flows/analyze-review-sentiment";

export async function submitReview(input: AnalyzeReviewSentimentInput): Promise<AnalyzeReviewSentimentOutput | null> {
  try {
    const result = await analyzeReviewSentiment(input);
    return result;
  } catch (error) {
    console.error("Error analyzing review sentiment:", error);
    // In a real app, you might want to throw a more specific error
    // that the client can handle gracefully.
    throw new Error("Failed to analyze sentiment.");
  }
}
