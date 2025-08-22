
"use server";

import { taskLibrary } from "@/lib/tasks";

// This type should align with the structure in your task library
export type GenerateTaskSuggestionOutput = {
  taskTitle: string;
  taskDescription: string;
  options: string[];
};

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
        const randomIndex = Math.floor(Math.random() * taskLibrary.length);
        const result = taskLibrary[randomIndex];
        return result;
    } catch (error) {
        console.error("Error getting task from library:", error);
        throw new Error("Failed to get task from library.");
    }
}
