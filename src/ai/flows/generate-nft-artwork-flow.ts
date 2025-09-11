
'use server';
/**
 * @fileOverview An AI flow to generate NFT artwork.
 *
 * - generateNftArtwork - A function that generates an image for an NFT.
 * - GenerateNftArtworkInput - The Zod schema for the input.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNftArtworkInputSchema = z.object({
  achievementTitle: z.string().describe('The title of the achievement being minted as an NFT.'),
});
export type GenerateNftArtworkInput = z.infer<typeof GenerateNftArtworkInputSchema>;

// This is the exported function that React components will call.
export async function generateNftArtwork(input: GenerateNftArtworkInput): Promise<string> {
  const result = await generateNftArtworkFlow(input);
  return result.artworkUrl;
}

// This is the Genkit flow definition.
const generateNftArtworkFlow = ai.defineFlow(
  {
    name: 'generateNftArtworkFlow',
    inputSchema: GenerateNftArtworkInputSchema,
    outputSchema: z.object({ artworkUrl: z.string() }),
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Create a visually stunning, abstract piece of digital art representing the achievement: "${input.achievementTitle}". The style should be futuristic, elegant, and worthy of being a collectible NFT. Use a vibrant but harmonious color palette. The output should be a square image.`,
    });

    if (!media?.url) {
      throw new Error('Failed to generate NFT artwork from the AI model.');
    }

    return { artworkUrl: media.url };
  }
);
