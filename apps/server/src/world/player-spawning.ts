import { world } from './world-manager';
import { getPlayerByUserId, updatePlayerLocation } from '@dnd-sur/database';
import type { WorldPlayer } from './schemas';

export interface PlayerSpawnResult {
  success: boolean;
  worldPlayer?: WorldPlayer;
  error?: string;
}

/**
 * Spawns a player in the world when they log in
 */
export async function spawnPlayerOnLogin(userId: string): Promise<PlayerSpawnResult> {
  // Check if player is already in the world
  const existingWorldPlayer = world.getPlayerInWorld(userId);
  if (existingWorldPlayer) {
    // Update activity and return existing player
    world.updatePlayerActivity(userId);
    console.log(`🔄 Player ${existingWorldPlayer.name} already in world, updating activity`);
    return { success: true, worldPlayer: existingWorldPlayer };
  }

  // Get player data from database
  const playerData = await getPlayerByUserId({ userId });
  
  if (!playerData) {
    console.log(`ℹ️ No player character found for user ${userId} - they need to create one first`);
    return { success: false, error: 'No player character found. Please create a character first.' };
  }

  // Spawn player in the world using their saved location
  const worldPlayer = world.spawnPlayer(userId, playerData.name, playerData.location);
  if (!worldPlayer) {
    return { success: false, error: 'Failed to spawn player in world' };
  }

  console.log(`✨ Player ${playerData.name} spawned in world at ${worldPlayer.locationId}`);
  return { success: true, worldPlayer };
}

/**
 * Removes a player from the world when they log out
 */
export function despawnPlayerOnLogout(userId: string): boolean {
  const success = world.despawnPlayer(userId);
  if (success) {
    console.log(`👋 Player ${userId} despawned from world on logout`);
  }
  return success;
}

/**
 * Updates player activity timestamp
 */
export function updatePlayerActivity(userId: string): void {
  world.updatePlayerActivity(userId);
}

/**
 * Gets player's current world state
 */
export function getPlayerWorldState(userId: string) {
  const worldPlayer = world.getPlayerInWorld(userId);
  if (!worldPlayer) {
    return null;
  }

  const locationInfo = world.getLocationInfo(worldPlayer.locationId);
  if (!locationInfo) {
    return null;
  }

  return {
    worldPlayer,
    currentLocation: locationInfo.location,
    playersInLocation: locationInfo.playersHere.filter(p => p.userId !== userId), // Exclude self
    connectedLocations: locationInfo.connectedLocations,
    worldStats: world.getWorldStats(),
  };
}

/**
 * Attempts to move a player to a new location
 */
export async function movePlayerInWorld(userId: string, targetLocationId: string): Promise<boolean> {
  const success = world.movePlayer(userId, targetLocationId);
  
  if (success) {
    // Save location to database (fire and forget - don't block movement on DB issues)
    savePlayerLocationToDB(userId, targetLocationId);
  }
  
  return success;
}

async function savePlayerLocationToDB(userId: string, locationId: string): Promise<void> {
  const playerData = await getPlayerByUserId({ userId });
  if (playerData) {
    await updatePlayerLocation({ playerId: playerData.id, location: locationId });
  }
}

/**
 * Cleanup function to remove inactive players (called periodically)
 */
export function cleanupInactivePlayers(timeoutMinutes = 30): number {
  return world.cleanupInactivePlayers(timeoutMinutes);
} 