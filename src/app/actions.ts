"use server";

import { generateTaskSuggestion as generateTaskSuggestionFlow, GenerateTaskSuggestionOutput } from "@/ai/flows/generate-task-suggestions";

// This is a placeholder for what would be the submitted review data.
// In a real application, you would define a schema for this.
export type ReviewSubmission = {
  taskTitle: string;
  rating: number;
  option: string;
};


export async function submitReview(input: ReviewSubmission): Promise<{success: boolean}> {
  try {
    // In a real app, you would save the review to a database here.
    // For now, we'll just log it to the console and assume success.
    console.log("Received review submission:", input);
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    throw new Error("Failed to submit review.");
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
