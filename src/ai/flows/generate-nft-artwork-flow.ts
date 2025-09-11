
'use server';
/**
 * @fileOverview An AI flow to generate NFT artwork.
 *
 * - generateNftArtwork - A function that generates an image for an NFT.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNftArtworkInputSchema = z.object({
  achievementTitle: z.string().describe('The title of the achievement being minted as an NFT.'),
});
export type GenerateNftArtworkInput = z.infer<typeof GenerateNftArtworkInputSchema>;


export async function generateNftArtwork(input: GenerateNftArtworkInput): Promise<string> {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Create a visually stunning, abstract piece of digital art representing the achievement: "${input.achievementTitle}". The style should be futuristic, elegant, and worthy of being a collectible NFT. Use a vibrant but harmonious color palette. The output should be a square image.`,
    });
    
    if (!media) {
        throw new Error('Failed to generate NFT artwork.');
    }

    return media.url;
}
