import { tool } from 'ai';
import { z } from 'zod';
import { createPlayer, getPlayerByUserId } from '@/lib/db/queries';

export const createPlayerTool = (userId: string) => tool({
  description: 'Create a new player character for the roguelike game. Only call this after confirming the user wants to create a character.',
  inputSchema: z.object({
    name: z.string().min(1).max(50).describe('The character name chosen by the player'),
    characterClass: z.enum(['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger']).describe('The character class chosen by the player'),
  }),
  execute: async ({ name, characterClass }) => {
    try {
      // Check if player already exists
      const existingPlayer = await getPlayerByUserId({ userId });
      
      if (existingPlayer) {
        return {
          success: false,
          error: 'Player already exists',
          player: existingPlayer,
        };
      }

      // Create new player
      const newPlayer = await createPlayer({
        userId,
        name,
        characterClass,
      });

      return {
        success: true,
        player: newPlayer,
        message: `Successfully created ${characterClass} character "${name}"`,
      };
    } catch (error) {
      console.error('Failed to create player:', error);
      return {
        success: false,
        error: 'Failed to create character',
      };
    }
  },
}); 