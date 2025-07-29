import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { spawnPlayerOnLogin, getPlayerWorldState, movePlayerInWorld, despawnPlayerOnLogout } from '../world/player-spawning.js';
import { world } from '../world/world-manager.js';

// Request/Response schemas
const SpawnPlayerSchema = z.object({
  userId: z.string().uuid(),
});


const MovePlayerSchema = z.object({
  userId: z.string().uuid(),
  targetLocationId: z.string(),
});

const DespawnPlayerSchema = z.object({
  userId: z.string().uuid(),
});

export const worldRoutes: FastifyPluginAsync = async (fastify) => {
  // Get world data (for visualizer)
  fastify.get('/data', async (_request, reply) => {
    const worldData = world.getWorldData();
    const activePlayers = world.getAllPlayersInWorld();
    
    // Group players by location
    const playersByLocation: Record<string, Array<{id: string, name: string, userId: string}>> = {};
    activePlayers.forEach(player => {
      if (!playersByLocation[player.locationId]) {
        playersByLocation[player.locationId] = [];
      }
      playersByLocation[player.locationId].push({
        id: player.id,
        name: player.name,
        userId: player.userId
      });
    });
    
    return {
      success: true,
      worldData,
      playersByLocation,
      totalActivePlayers: activePlayers.length
    };
  });
  // Spawn player in world
  fastify.post('/spawn', async (request, reply) => {
    const { userId } = SpawnPlayerSchema.parse(request.body);
    const result = await spawnPlayerOnLogin(userId);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: result.error
      });
    }
    
    return {
      success: true,
      worldPlayer: result.worldPlayer
    };
  });

  // Get player's current world state (for look-around)
  fastify.get('/player/:userId/state', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    z.string().uuid().parse(userId);
    
    const worldState = getPlayerWorldState(userId);
    
    if (!worldState) {
      return reply.status(404).send({
        success: false,
        error: 'Player not found in world'
      });
    }
    
    return {
      success: true,
      ...worldState
    };
  });

  // Move player to new location
  fastify.post('/move', async (request, reply) => {
    const { userId, targetLocationId } = MovePlayerSchema.parse(request.body);
    const success = await movePlayerInWorld(userId, targetLocationId);
    
    if (!success) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to move player'
      });
    }
    
    return {
      success: true,
      message: 'Player moved successfully'
    };
  });

  // Despawn player from world
  fastify.post('/despawn', async (request, reply) => {
    const { userId } = DespawnPlayerSchema.parse(request.body);
    const success = despawnPlayerOnLogout(userId);
    
    return {
      success,
      message: success ? 'Player despawned successfully' : 'Player not found in world'
    };
  });
};