
"use server";

import { taskLibrary as defaultTasks, Task } from "@/lib/tasks";
import { generateNewTaskLibrary as generateNewTaskLibraryFlow } from "@/ai/flows/generate-task-library-flow";

// This type should align with the structure in your task library
export type GenerateTaskSuggestionOutput = Task;

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
        // Use the localStorage version if it exists, otherwise fall back to the default.
        // This is a client-side concept, so for server action, we will rely on default.
        // A real app would use a database.
        const taskLibrary = defaultTasks;
        const randomIndex = Math.floor(Math.random() * taskLibrary.length);
        const result = taskLibrary[randomIndex];
        return result;
    } catch (error) {
        console.error("Error getting task from library:", error);
        throw new Error("Failed to get task from library.");
    }
}

export async function generateNewTaskLibrary(count: number) {
    return await generateNewTaskLibraryFlow({ count });
}
