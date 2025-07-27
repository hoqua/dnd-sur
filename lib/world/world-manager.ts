import { WorldDataSchema, LocationSchema, type WorldData, type Location, type WorldPlayer, type Coordinates } from './schemas';
import worldDataJson from './world-data.json';

class WorldManager {
  private static instance: WorldManager | null = null;
  private worldData: WorldData;
  private activePlayers: Map<string, WorldPlayer> = new Map();
  private readonly SPAWN_LOCATIONS = ['cell_0_0', 'cell_0_9', 'cell_9_0', 'cell_9_9']; // Corner starting positions

  private constructor() {
    // Validate world data on initialization
    const parseResult = WorldDataSchema.safeParse(worldDataJson);
    if (!parseResult.success) {
      console.error('Invalid world data:', parseResult.error);
      throw new Error('Failed to load world data: Invalid schema');
    }
    this.worldData = parseResult.data;
    console.log(`🌍 World Manager initialized: ${this.worldData.meta.name} v${this.worldData.meta.version}`);
  }

  public static getInstance(): WorldManager {
    if (!WorldManager.instance) {
      WorldManager.instance = new WorldManager();
    }
    return WorldManager.instance;
  }

  // World Data Access
  public getWorldData(): WorldData {
    return this.worldData;
  }

  public getLocation(locationId: string): Location | null {
    const location = this.worldData.locations[locationId];
    if (!location) return null;
    
    // Validate location data
    const parseResult = LocationSchema.safeParse(location);
    if (!parseResult.success) {
      console.error(`Invalid location data for ${locationId}:`, parseResult.error);
      return null;
    }
    return parseResult.data;
  }

  public getAllLocations(): Record<string, Location> {
    return this.worldData.locations;
  }

  public getLocationsByRegion(region: string): Location[] {
    return Object.values(this.worldData.locations).filter(loc => loc.region === region);
  }

  public getConnectedLocations(locationId: string): Location[] {
    const location = this.getLocation(locationId);
    if (!location) return [];

    return location.connections
      .map(connId => this.getLocation(connId))
      .filter((loc): loc is Location => loc !== null);
  }

  // Player Management
  public spawnPlayer(userId: string, playerName: string): WorldPlayer | null {
    try {
      // Remove existing player if they're already in the world
      this.despawnPlayer(userId);

      // Find a random spawn location (corners - difficulty level 1)
      const spawnLocationId = this.SPAWN_LOCATIONS[Math.floor(Math.random() * this.SPAWN_LOCATIONS.length)];
      const spawnLocation = this.getLocation(spawnLocationId);
      
      if (!spawnLocation) {
        console.error(`Spawn location ${spawnLocationId} not found`);
        return null;
      }

      const worldPlayer: WorldPlayer = {
        id: `player_${userId}_${Date.now()}`,
        userId,
        name: playerName,
        locationId: spawnLocationId,
        coordinates: spawnLocation.coordinates,
        joinedAt: new Date(),
        lastActive: new Date(),
      };

      this.activePlayers.set(userId, worldPlayer);
      console.log(`👤 Player ${playerName} spawned at ${spawnLocation.name} (${spawnLocationId})`);
      return worldPlayer;
    } catch (error) {
      console.error('Failed to spawn player:', error);
      return null;
    }
  }

  public despawnPlayer(userId: string): boolean {
    const player = this.activePlayers.get(userId);
    if (player) {
      this.activePlayers.delete(userId);
      console.log(`👋 Player ${player.name} despawned from ${player.locationId}`);
      return true;
    }
    return false;
  }

  public getPlayerInWorld(userId: string): WorldPlayer | null {
    return this.activePlayers.get(userId) || null;
  }

  public getAllPlayersInWorld(): WorldPlayer[] {
    return Array.from(this.activePlayers.values());
  }

  public getPlayersInLocation(locationId: string): WorldPlayer[] {
    return Array.from(this.activePlayers.values()).filter(player => player.locationId === locationId);
  }

  public movePlayer(userId: string, targetLocationId: string): boolean {
    const player = this.activePlayers.get(userId);
    if (!player) {
      console.error(`Player ${userId} not found in world`);
      return false;
    }

    const currentLocation = this.getLocation(player.locationId);
    const targetLocation = this.getLocation(targetLocationId);

    if (!currentLocation || !targetLocation) {
      console.error(`Invalid locations: current=${player.locationId}, target=${targetLocationId}`);
      return false;
    }

    // Check if movement is valid (connected locations)
    if (!currentLocation.connections.includes(targetLocationId)) {
      console.error(`Invalid movement: ${player.locationId} -> ${targetLocationId} (not connected)`);
      return false;
    }

    // Update player position
    player.locationId = targetLocationId;
    player.coordinates = targetLocation.coordinates;
    player.lastActive = new Date();

    console.log(`🚶 Player ${player.name} moved from ${currentLocation.name} to ${targetLocation.name}`);
    return true;
  }

  public updatePlayerActivity(userId: string): void {
    const player = this.activePlayers.get(userId);
    if (player) {
      player.lastActive = new Date();
    }
  }

  // Cleanup inactive players (called periodically)
  public cleanupInactivePlayers(timeoutMinutes: number = 30): number {
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const initialCount = this.activePlayers.size;
    
    for (const [userId, player] of this.activePlayers.entries()) {
      if (player.lastActive < cutoffTime) {
        this.despawnPlayer(userId);
      }
    }

    const removedCount = initialCount - this.activePlayers.size;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} inactive players`);
    }
    return removedCount;
  }

  // Utility methods
  public getWorldStats() {
    return {
      totalLocations: Object.keys(this.worldData.locations).length,
      activePlayers: this.activePlayers.size,
      worldName: this.worldData.meta.name,
      worldVersion: this.worldData.meta.version,
    };
  }

  public getLocationInfo(locationId: string) {
    const location = this.getLocation(locationId);
    if (!location) return null;

    const playersHere = this.getPlayersInLocation(locationId);
    const connectedLocations = this.getConnectedLocations(locationId);

    return {
      location,
      playersHere,
      connectedLocations,
      playerCount: playersHere.length,
      connectionCount: connectedLocations.length,
    };
  }
}

// Export singleton instance
export const world = WorldManager.getInstance();
export type { WorldManager }; 