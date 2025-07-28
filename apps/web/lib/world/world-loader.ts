// Re-export everything from the new world manager and schemas
export { world } from './world-manager';
export { 
  CoordinatesSchema,
  WorldObjectSchema,
  NPCSchema,
  LocationSchema,
  WorldMetaSchema,
  WorldDataSchema,
  WorldPlayerSchema,
  type Coordinates,
  type WorldObject,
  type NPC,
  type Location,
  type WorldMeta,
  type WorldData,
  type WorldPlayer
} from './schemas';

// Legacy compatibility functions (deprecated - use world singleton instead)
export function loadWorld() {
  console.warn('loadWorld() is deprecated. Use world.getWorldData() instead.');
  const { world } = require('./world-manager');
  return world.getWorldData();
}

export function getLocation(locationId: string) {
  console.warn('getLocation() is deprecated. Use world.getLocation() instead.');
  const { world } = require('./world-manager');
  return world.getLocation(locationId);
}

export function getAllLocations() {
  console.warn('getAllLocations() is deprecated. Use world.getAllLocations() instead.');
  const { world } = require('./world-manager');
  return world.getAllLocations();
}

export function getLocationsByRegion(region: string) {
  console.warn('getLocationsByRegion() is deprecated. Use world.getLocationsByRegion() instead.');
  const { world } = require('./world-manager');
  return world.getLocationsByRegion(region);
}

export function getConnectedLocations(locationId: string) {
  console.warn('getConnectedLocations() is deprecated. Use world.getConnectedLocations() instead.');
  const { world } = require('./world-manager');
  return world.getConnectedLocations(locationId);
} 