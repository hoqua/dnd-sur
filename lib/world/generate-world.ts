import type { World, Location, NPC, WorldObject } from './world-loader';

interface WorldConfig {
  size: number; // Grid size (10 = 10x10 = 100 cells)
  centerX: number;
  centerY: number;
}

interface DifficultyZone {
  level: number; // 1=easiest, 5=hardest
  biome: string;
  locationTypes: string[];
  npcTypes: { type: string; health: number; }[];
  objectTypes: string[];
}

const DIFFICULTY_ZONES: Record<number, DifficultyZone> = {
  1: { // Edges - Starting areas
    level: 1,
    biome: 'Peaceful Lands',
    locationTypes: ['town', 'village', 'farmland', 'meadow'],
    npcTypes: [
      { type: 'merchant', health: 80 },
      { type: 'villager', health: 60 },
      { type: 'guard', health: 100 }
    ],
    objectTypes: ['wooden_stick', 'healing_herb', 'bread', 'well']
  },
  2: { // Near edges - Easy exploration
    level: 2,
    biome: 'Borderlands',
    locationTypes: ['forest', 'hills', 'path', 'ruins'],
    npcTypes: [
      { type: 'bandit', health: 120 },
      { type: 'wolf', health: 80 },
      { type: 'hermit', health: 90 }
    ],
    objectTypes: ['iron_sword', 'leather_armor', 'trap', 'treasure_chest']
  },
  3: { // Middle ring - Moderate challenge
    level: 3,
    biome: 'Wild Territories',
    locationTypes: ['dark_forest', 'swamp', 'canyon', 'abandoned_tower'],
    npcTypes: [
      { type: 'orc', health: 150 },
      { type: 'giant_spider', health: 120 },
      { type: 'dark_mage', health: 180 }
    ],
    objectTypes: ['steel_sword', 'magic_armor', 'poison_trap', 'spellbook']
  },
  4: { // Inner ring - Hard areas
    level: 4,
    biome: 'Cursed Lands',
    locationTypes: ['dungeon', 'necropolis', 'demon_cave', 'cursed_temple'],
    npcTypes: [
      { type: 'skeleton_warrior', health: 200 },
      { type: 'demon', health: 250 },
      { type: 'lich', health: 300 }
    ],
    objectTypes: ['enchanted_blade', 'mithril_armor', 'death_trap', 'artifact']
  },
  5: { // Center - Boss areas
    level: 5,
    biome: 'Heart of Darkness',
    locationTypes: ['dragon_lair', 'ancient_temple', 'void_portal', 'throne_room'],
    npcTypes: [
      { type: 'ancient_dragon', health: 500 },
      { type: 'void_lord', health: 400 },
      { type: 'fallen_god', health: 600 }
    ],
    objectTypes: ['legendary_weapon', 'divine_armor', 'ultimate_trap', 'world_crystal']
  }
};

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)); // Chebyshev distance
}

function getDifficultyLevel(x: number, y: number, config: WorldConfig): number {
  const distance = calculateDistance(x, y, config.centerX, config.centerY);
  const maxDistance = Math.max(config.centerX, config.centerY, 
                               config.size - 1 - config.centerX, 
                               config.size - 1 - config.centerY);
  
  // Map distance to difficulty (1-5)
  const normalized = distance / maxDistance;
  return Math.max(1, Math.min(5, Math.ceil((1 - normalized) * 5)));
}

function generateLocationName(x: number, y: number, zone: DifficultyZone): string {
  const typeIndex = (x + y) % zone.locationTypes.length;
  const locationType = zone.locationTypes[typeIndex];
  
  const prefixes = {
    1: ['Sunny', 'Peaceful', 'Green', 'Safe'],
    2: ['Old', 'Wild', 'Hidden', 'Lost'],
    3: ['Dark', 'Twisted', 'Forgotten', 'Haunted'],
    4: ['Cursed', 'Forbidden', 'Damned', 'Evil'],
    5: ['Ancient', 'Ultimate', 'Eternal', 'Divine']
  };
  
  const prefix = prefixes[zone.level as keyof typeof prefixes][(x * y) % 4];
  const capitalizedType = locationType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return `${prefix} ${capitalizedType}`;
}

function generateConnections(x: number, y: number, size: number): string[] {
  const connections: string[] = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1] // left, right, up, down
  ];
  
  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    
    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      connections.push(`cell_${newX}_${newY}`);
    }
  }
  
  return connections;
}

function generateNPCs(zone: DifficultyZone, x: number, y: number): NPC[] {
  const npcs: NPC[] = [];
  const npcCount = Math.min(3, zone.level); // 1-3 NPCs based on difficulty
  
  for (let i = 0; i < npcCount; i++) {
    const npcTemplate = zone.npcTypes[(x + y + i) % zone.npcTypes.length];
    const name = `${npcTemplate.type.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ')} ${String.fromCharCode(65 + ((x + y + i) % 26))}`;
    
    npcs.push({
      name,
      type: npcTemplate.type as any,
      description: `A ${npcTemplate.type.replace('_', ' ')} found in this area`,
      health: npcTemplate.health
    });
  }
  
  return npcs;
}

function generateObjects(zone: DifficultyZone, x: number, y: number): WorldObject[] {
  const objects: WorldObject[] = [];
  const objectCount = Math.min(4, zone.level + 1); // 2-5 objects based on difficulty
  
  for (let i = 0; i < objectCount; i++) {
    const objName = zone.objectTypes[(x + y + i) % zone.objectTypes.length];
    const name = objName.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    
    objects.push({
      name,
      type: objName.includes('trap') ? 'trap' : 
            objName.includes('armor') || objName.includes('sword') || objName.includes('weapon') ? 'item' :
            'decoration',
      description: `A ${name.toLowerCase()} found in this dangerous area`
    });
  }
  
  return objects;
}

export function generateLargeWorld(): World {
  const config: WorldConfig = {
    size: 10,
    centerX: 4,
    centerY: 4
  };
  
  const locations: Record<string, Location> = {};
  
  // Generate all locations
  for (let x = 0; x < config.size; x++) {
    for (let y = 0; y < config.size; y++) {
      const locationId = `cell_${x}_${y}`;
      const difficultyLevel = getDifficultyLevel(x, y, config);
      const zone = DIFFICULTY_ZONES[difficultyLevel];
      
      const location: Location = {
        name: generateLocationName(x, y, zone),
        description: `A ${zone.biome.toLowerCase()} location with difficulty level ${difficultyLevel}. ${zone.locationTypes[(x + y) % zone.locationTypes.length].replace('_', ' ')} area.`,
        region: zone.biome,
        coordinates: { x, y },
        type: zone.locationTypes[(x + y) % zone.locationTypes.length] as any,
        connections: generateConnections(x, y, config.size),
        npcs: generateNPCs(zone, x, y),
        objects: generateObjects(zone, x, y)
      };
      
      locations[locationId] = location;
    }
  }
  
  return {
    meta: {
      name: "Adventure Realm - Extended World",
      version: "2.0",
      description: "A vast 100-cell world with difficulty progression from peaceful edges to the dangerous center"
    },
    locations
  };
} 