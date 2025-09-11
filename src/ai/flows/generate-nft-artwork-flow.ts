
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
  // This function is now a placeholder and will not be called
  // as the AI generation feature is disabled due to billing issues.
  // We keep the file to avoid breaking imports, but the logic is moved to a manual upload.
  throw new Error('AI artwork generation is disabled.');
}
