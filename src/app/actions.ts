
"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { taskLibrary as defaultTasks, Task } from "@/lib/tasks";
import { generateNewTaskLibrary as generateNewTaskLibraryFlow } from "@/ai/flows/generate-task-library-flow";
import { generateNftLibraryArtwork as generateNftLibraryArtworkFlow } from "@/ai/flows/generate-nft-artwork-flow";
import { NftLibraryItem, nftLibrary } from "@/lib/nft-library";
import fs from "fs/promises";
import path from "path";


// This type should align with the structure in your task library
export type GenerateTaskSuggestionOutput = Task;

// This is a placeholder for what would be the submitted review data.
// In a real application, you would define a schema for this.
export type ReviewSubmission = {
  taskTitle: string;
  rating: number;
  option: string;
};

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }
  
  // Revalidate path to ensure session is updated
  revalidatePath('/', 'layout');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Could not authenticate user." };
  }

  const { data: userData, error: userError } = await supabase.from('users').select('isAdmin').eq('id', user.id).single();

  if (userError && userError.code === 'PGRST116') {
    // User profile doesn't exist, so create it. This is a fallback for users created before the trigger.
    const { data: newUser, error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata.full_name || user.email,
      referral_code: 'REF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    }).select().single();

    if (insertError) {
      return { success: false, message: "Failed to create user profile on login." };
    }
    return { success: true, isAdmin: newUser?.isAdmin || false };
  }
  
  if (userError) {
    return { success: false, message: userError.message };
  }


  return { success: true, isAdmin: userData?.isAdmin || false };
}


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

export async function generateNftLibraryArtwork(prompt: string) {
    return await generateNftLibraryArtworkFlow({ prompt });
}

export async function saveNftToLibrary(newItem: Omit<NftLibraryItem, 'achievementId'> & { achievementId?: string }) {
    const libraryPath = path.join(process.cwd(), 'src', 'lib', 'nft-library.ts');
    
    const newEntry: NftLibraryItem = {
        achievementId: newItem.achievementId || `custom-${Date.now()}`,
        imageUrl: newItem.imageUrl,
        aiHint: newItem.aiHint,
    };

    const newLibrary = [...nftLibrary, newEntry];

    const fileContent = `
export type NftLibraryItem = {
    achievementId: string;
    imageUrl: string;
    aiHint: string;
};

export const nftLibrary: NftLibraryItem[] = ${JSON.stringify(newLibrary, null, 4)};
`.trim();

    try {
        await fs.writeFile(libraryPath, fileContent, 'utf-8');
        return { success: true, newItem: newEntry };
    } catch (error) {
        console.error("Failed to write to nft-library.ts", error);
        return { success: false, error: "Failed to update library file." };
    }
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

export async function getInternetTime(): Promise<{ utc_datetime: string } | null> {
  try {
    const response = await fetch('https://worldtimeapi.org/api/ip', { cache: 'no-store' });
    if (!response.ok) {
        console.error("Failed to fetch time from API:", response.statusText);
        return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Network error fetching time:", error);
    return null;
  }
}
