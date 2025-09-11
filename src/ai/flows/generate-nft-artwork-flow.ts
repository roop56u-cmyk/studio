
'use server';
/**
 * @fileOverview An AI flow to generate NFT artwork for the library.
 *
 * - generateNftLibraryArtwork - A function that generates an image for the NFT library.
 * - GenerateNftArtworkInput - The Zod schema for the input.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNftLibraryArtworkInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
});
export type GenerateNftArtworkInput = z.infer<typeof GenerateNftLibraryArtworkInputSchema>;

export async function generateNftLibraryArtwork(input: GenerateNftArtworkInput): Promise<{ imageUrl: string }> {
  const result = await generateNftArtworkFlow(input);
  return result;
}

const generateNftArtworkFlow = ai.defineFlow(
  {
    name: 'generateNftLibraryArtworkFlow',
    inputSchema: GenerateNftLibraryArtworkInputSchema,
    outputSchema: z.object({ imageUrl: z.string() }),
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Create a visually stunning, abstract piece of digital art representing: "${input.prompt}". The style should be futuristic, elegant, and worthy of being a collectible NFT. Use a vibrant but harmonious color palette. The output should be a square image. Ensure the final image has a distinct and visually appealing border.`,
    });

    if (!media?.url) {
      throw new Error('Failed to generate NFT artwork from the AI model.');
    }

    return { imageUrl: media.url };
  }
);
