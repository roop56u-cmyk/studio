'use server';

/**
 * @fileOverview Analyzes the sentiment of user-generated review text.
 *
 * - analyzeReviewSentiment - A function that analyzes the sentiment of a review.
 * - AnalyzeReviewSentimentInput - The input type for the analyzeReviewSentiment function.
 * - AnalyzeReviewSentimentOutput - The return type for the analyzeReviewSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReviewSentimentInputSchema = z.object({
  reviewText: z
    .string()
    .describe('The text content of the review to be analyzed.'),
});
export type AnalyzeReviewSentimentInput = z.infer<typeof AnalyzeReviewSentimentInputSchema>;

const AnalyzeReviewSentimentOutputSchema = z.object({
  sentiment: z
    .enum(['positive', 'negative', 'neutral'])
    .describe('The sentiment of the review text.'),
  confidence: z
    .number()
    .describe('The confidence level of the sentiment analysis (0-1).'),
});
export type AnalyzeReviewSentimentOutput = z.infer<typeof AnalyzeReviewSentimentOutputSchema>;

export async function analyzeReviewSentiment(input: AnalyzeReviewSentimentInput): Promise<AnalyzeReviewSentimentOutput> {
  return analyzeReviewSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReviewSentimentPrompt',
  input: {schema: AnalyzeReviewSentimentInputSchema},
  output: {schema: AnalyzeReviewSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following review text.  Your response should be only "positive", "negative", or "neutral".  Also, return a confidence score between 0 and 1.

Review Text: {{{reviewText}}}`,
});

const analyzeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeReviewSentimentFlow',
    inputSchema: AnalyzeReviewSentimentInputSchema,
    outputSchema: AnalyzeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
