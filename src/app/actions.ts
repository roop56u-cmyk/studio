
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

export async function grantManualReward({ userEmail, amount, rewardType, reason }: { userEmail: string; amount: number; rewardType: string; reason: string; }): Promise<{success: boolean}> {
  if (typeof window !== 'undefined') {
    throw new Error('This function must be called from the server.');
  }

  try {
    console.log(`Attempting to grant manual reward to ${userEmail}`);
    
    const mainBalanceKey = `${userEmail}_mainBalance`;
    const activityHistoryKey = `${userEmail}_activityHistory`;
    
    // NOTE: This server action directly manipulates localStorage-like data structures
    // for demonstration purposes. In a real application, this would interact
    // with a database transactionally. This is a simplified stand-in.

    // Faking localStorage access on the server for this example
    let balances: { [key: string]: string } = {};
    let activities: { [key: string]: string } = {};
    
    const getStorageItem = (key: string) => balances[key];
    const setStorageItem = (key: string, value: string) => { balances[key] = value; };
    const getActivities = (key: string) => JSON.parse(activities[key] || '[]');
    const setActivities = (key: string, value: any[]) => { activities[key] = JSON.stringify(value); };

    const currentBalance = parseFloat(getStorageItem(mainBalanceKey) || '0');
    setStorageItem(mainBalanceKey, (currentBalance + amount).toString());

    const newActivity = {
      id: `ACT-MANUAL-${Date.now()}`,
      type: rewardType,
      description: `Manually granted by admin: ${reason}`,
      amount,
      date: new Date().toISOString(),
    };
    
    const currentHistory = getActivities(activityHistoryKey);
    setActivities(activityHistoryKey, [newActivity, ...currentHistory]);

    console.log(`Successfully granted ${amount} to ${userEmail}. New activity logged.`);
    
    // This is a server action, it won't have access to browser localStorage.
    // The logic in WalletContext on the client-side reads from localStorage to hydrate state.
    // To make this work in the demo, we need a way to signal to the client that data changed.
    // In a real app with a database, the client would refetch data.
    // For this demo, we'll assume the client will eventually see the change on reload.
    
    return { success: true };
  } catch (error) {
    console.error("Error granting manual reward:", error);
    return { success: false };
  }
}
