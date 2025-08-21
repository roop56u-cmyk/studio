'use server';

/**
 * @fileOverview Generates a single diverse task suggestion for a user to review.
 *
 * - generateTaskSuggestion - A function that returns a single task suggestion.
 * - GenerateTaskSuggestionOutput - The return type for the generateTaskSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateTaskSuggestionOutputSchema = z.object({
  task: z.string().describe('A diverse and engaging task title for a user to review.'),
});
export type GenerateTaskSuggestionOutput = z.infer<typeof GenerateTaskSuggestionOutputSchema>;


export async function generateTaskSuggestion(): Promise<GenerateTaskSuggestionOutput> {
  const prompt = ai.definePrompt({
      name: 'generateTaskSuggestionPrompt',
      output: {schema: GenerateTaskSuggestionOutputSchema},
      prompt: `You are an AI assistant for a review platform. Your goal is to provide a diverse and interesting task title that a user can review.

The category should be from a wide range, from everyday services to niche online activities. Make it specific and engaging.

Examples of good suggestions:
- Reviewing a local coffee shop's new seasonal drink
- Rating the user interface of a popular mobile game
- Assessing the quality of a freelance graphic design service
- Reviewing a guided meditation app

Generate one unique task title now.`,
  });

  const {output} = await prompt();
  return output!;
}
