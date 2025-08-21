"use server";

import { analyzeReviewSentiment, AnalyzeReviewSentimentInput, AnalyzeReviewSentimentOutput } from "@/ai/flows/analyze-review-sentiment";
import { generateTaskSuggestion as generateTaskSuggestionFlow, GenerateTaskSuggestionOutput } from "@/ai/flows/generate-task-suggestions";

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

export async function generateTaskSuggestion(): Promise<GenerateTaskSuggestionOutput> {
    try {
        const result = await generateTaskSuggestionFlow();
        return result;
    } catch (error) {
        console.error("Error generating task suggestion:", error);
        throw new Error("Failed to generate task suggestion.");
    }
}
