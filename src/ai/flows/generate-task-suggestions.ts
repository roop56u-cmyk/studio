'use server';

/**
 * @fileOverview Generates a single diverse task suggestion for a user to review, including a description and review options.
 *
 * - generateTaskSuggestion - A function that returns a single task suggestion.
 * - GenerateTaskSuggestionOutput - The return type for the generateTaskSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateTaskSuggestionOutputSchema = z.object({
  taskTitle: z.string().describe('A diverse and engaging task title for a user to review.'),
  taskDescription: z.string().describe('A brief, one-sentence description of what the task is about.'),
  options: z.array(z.string()).length(4).describe('Four distinct, relevant options for the user to select as their primary feedback.'),
});
export type GenerateTaskSuggestionOutput = z.infer<typeof GenerateTaskSuggestionOutputSchema>;


export async function generateTaskSuggestion(): Promise<GenerateTaskSuggestionOutput> {
  const generateTaskSuggestionFlow = ai.defineFlow(
    {
      name: 'generateTaskSuggestionFlow',
      outputSchema: GenerateTaskSuggestionOutputSchema,
    },
    async () => {
        const prompt = ai.definePrompt({
          name: 'generateTaskSuggestionPrompt',
          output: {schema: GenerateTaskSuggestionOutputSchema},
          prompt: `You are an AI assistant for a review platform. Your goal is to provide a diverse and interesting task for a user to review.

The task should be from a wide range, from everyday services to niche online activities. Make it specific and engaging.

You need to provide:
1.  A short, catchy "taskTitle".
2.  A one-sentence "taskDescription" explaining the task.
3.  An array of four distinct "options" that a user could choose to describe their experience. These options should be relevant to the task.

Examples of good suggestions:
- taskTitle: "Review a local coffee shop's new seasonal drink"
- taskDescription: "Taste and rate the new 'Pumpkin Spice Cold Brew' at your neighborhood cafe."
- options: ["Amazingly festive flavor!", "It was just okay.", "Too sweet for my liking.", "Didn't taste like pumpkin at all."]

- taskTitle: "Rate the user interface of a popular mobile game"
- taskDescription: "Assess the layout, navigation, and overall user experience of the game 'Galaxy Raiders'."
- options: ["Incredibly intuitive and fun!", "A bit cluttered but usable.", "Confusing and hard to navigate.", "The UI is buggy and crashes."]

Generate one unique task suggestion now.`,
      });

      const {output} = await prompt();
      return output!;
    }
  );

  return await generateTaskSuggestionFlow();
}
