
'use server';
/**
 * @fileOverview An AI flow to generate a new library of user tasks.
 *
 * - generateNewTaskLibrary - A function that returns a list of new tasks.
 * - Task - The Zod schema for a single task.
 * - TaskLibrary - The Zod schema for a list of tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
    taskTitle: z.string().describe("A short, engaging title for a simple review task. Max 15 words."),
    taskDescription: z.string().describe("A one-sentence description of the task. Max 25 words."),
    options: z.array(z.string().describe("A concise review option, max 10 words.")).length(4).describe("Four distinct review options for the user to choose from."),
});
export type Task = z.infer<typeof TaskSchema>;

const TaskLibrarySchema = z.object({
  tasks: z.array(TaskSchema).length(20).describe("A list of exactly 20 unique review tasks."),
});
export type TaskLibrary = z.infer<typeof TaskLibrarySchema>;


const prompt = ai.definePrompt({
  name: 'generateTaskLibraryPrompt',
  output: {schema: TaskLibrarySchema},
  prompt: `You are an expert at creating engaging micro-tasks for a user review platform. 
  
  Your goal is to generate a diverse and interesting list of 20 unique tasks.
  
  The tasks should cover a wide range of topics, including:
  - Reviewing digital products (apps, websites, games)
  - Evaluating physical products (gadgets, food, clothing)
  - Assessing local services (restaurants, stores, parks)
  - Giving opinions on media (movies, books, music)
  
  For each task, provide a concise title, a brief description, and exactly four distinct review options. The options should represent a spectrum of opinions from positive to negative. Ensure all generated text is creative, clear, and sounds natural. Do not repeat tasks.`,
});

export const generateNewTaskLibrary = ai.defineFlow(
  {
    name: 'generateNewTaskLibraryFlow',
    outputSchema: TaskLibrarySchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);

    