import { tool } from 'ai';
import { z } from 'zod';

const WORLD_SERVER_URL = process.env.WORLD_SERVER_URL || 'http://localhost:3001';

export const createLookAroundTool = (userId: string) => tool({
  description: 'Look around the current location to see what is nearby, including other players, NPCs, objects, and exits.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const response = await fetch(`${WORLD_SERVER_URL}/api/world/player/${userId}/state`);
      
      if (!response.ok) {
        return {
          success: false,
          error: 'You are not currently in the world. Please wait a moment for your character to be placed.',
        };
      }
      
      const worldState = await response.json();
      
      if (!worldState.success) {
        return {
          success: false,
          error: worldState.error || 'Unable to get world state.',
        };
      }

      const { currentLocation, playersInLocation, connectedLocations } = worldState;
      
      let description = `**${currentLocation.name}**\n\n${currentLocation.description}\n\n`;
      
      // Add NPCs
      if (currentLocation.npcs && currentLocation.npcs.length > 0) {
        description += `**Characters Present:**\n`;
        currentLocation.npcs.forEach((npc: any) => {
          description += `• **${npc.name}** - ${npc.description}\n`;
        });
        description += '\n';
      }
      
      // Add other players
      if (playersInLocation.length > 0) {
        description += `**Other Adventurers Here:**\n`;
        playersInLocation.forEach((player: any) => {
          description += `• ${player.name}\n`;
        });
        description += '\n';
      }
      
      // Add exits
      if (connectedLocations.length > 0) {
        description += `**Exits:**\n`;
        connectedLocations.forEach((location: any) => {
          description += `• **${location.name}** (${location.type})\n`;
        });
      }
      
      return {
        success: true,
        locationName: currentLocation.name,
        description,
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Unable to look around at the moment.',
      };
    }
  },
}); 