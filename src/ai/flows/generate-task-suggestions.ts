'use server';

/**
 * @fileOverview Generates a list of diverse task suggestions for users to review.
 *
 * - generateTaskSuggestions - A function that returns a list of task suggestions.
 * - GenerateTaskSuggestionsOutput - The return type for the generateTaskSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


export const GenerateTaskSuggestionsOutputSchema = z.object({
  tasks: z.array(z.string()).length(4).describe('A list of four diverse and engaging task suggestions for users to review.'),
});
export type GenerateTaskSuggestionsOutput = z.infer<typeof GenerateTaskSuggestionsOutputSchema>;

export async function generateTaskSuggestions(): Promise<GenerateTaskSuggestionsOutput> {
  return generateTaskSuggestionsFlow();
}

const prompt = ai.definePrompt({
  name: 'generateTaskSuggestionsPrompt',
  output: {schema: GenerateTaskSuggestionsOutputSchema},
  prompt: `You are an AI assistant for a review platform. Your goal is to provide a diverse and interesting list of four tasks or services that users can review.

The categories should be wide-ranging, from everyday services to niche online activities. Make them specific and engaging.

Examples of good suggestions:
- Reviewing a local coffee shop's new seasonal drink
- Rating the user interface of a popular mobile game
- Assessing the quality of a freelance graphic design service
- Reviewing a guided meditation app

Generate four unique suggestions now.`,
});

const generateTaskSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateTaskSuggestionsFlow',
    outputSchema: GenerateTaskSuggestionsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
