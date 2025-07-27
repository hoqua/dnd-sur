import { z } from 'zod';

// Base coordinate schema
export const CoordinatesSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

// World object schema
export const WorldObjectSchema = z.object({
  name: z.string(),
  type: z.enum(['item', 'decoration', 'trap', 'obstacle']),
  description: z.string(),
});

// NPC schema  
export const NPCSchema = z.object({
  name: z.string(),
  type: z.enum(['merchant', 'villager', 'guard', 'bandit', 'wolf', 'hermit', 'orc', 'giant_spider', 'dark_mage', 'skeleton_warrior', 'demon', 'lich', 'ancient_dragon', 'void_lord', 'fallen_god', 'quest_giver', 'trader', 'mystical', 'wise_sage', 'hostile']),
  description: z.string(),
  health: z.number().int().positive(),
});

// Location schema
export const LocationSchema = z.object({
  name: z.string(),
  description: z.string(),
  region: z.string(),
  coordinates: CoordinatesSchema,
  type: z.enum(['town', 'village', 'farmland', 'meadow', 'forest', 'hills', 'path', 'ruins', 'dark_forest', 'swamp', 'canyon', 'abandoned_tower', 'dungeon', 'necropolis', 'demon_cave', 'cursed_temple', 'dragon_lair', 'ancient_temple', 'void_portal', 'throne_room', 'mountain', 'cave']),
  connections: z.array(z.string()),
  npcs: z.array(NPCSchema),
  objects: z.array(WorldObjectSchema),
});

// World metadata schema
export const WorldMetaSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
});

// Full world schema
export const WorldDataSchema = z.object({
  meta: WorldMetaSchema,
  locations: z.record(z.string(), LocationSchema),
});

// Active player in world schema
export const WorldPlayerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  locationId: z.string(),
  coordinates: CoordinatesSchema,
  joinedAt: z.date(),
  lastActive: z.date(),
});

// Derived TypeScript types
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type WorldObject = z.infer<typeof WorldObjectSchema>;
export type NPC = z.infer<typeof NPCSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type WorldMeta = z.infer<typeof WorldMetaSchema>;
export type WorldData = z.infer<typeof WorldDataSchema>;
export type WorldPlayer = z.infer<typeof WorldPlayerSchema>; 