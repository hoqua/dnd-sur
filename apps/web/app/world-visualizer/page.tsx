'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

const WORLD_SERVER_URL = process.env.NEXT_PUBLIC_WORLD_SERVER_URL || 'http://localhost:3001';

interface Location {
  name: string;
  description: string;
  region: string;
  coordinates: { x: number; y: number };
  type: string;
  connections: string[];
  npcs: Array<{ name: string; type: string; description: string; health: number }>;
  objects: Array<{ name: string; type: string; description: string }>;
}

interface WorldData {
  meta: {
    name: string;
    version: string;
    description: string;
  };
  locations: Record<string, Location>;
}

interface WorldDataResponse {
  success: boolean;
  worldData: WorldData;
  playersByLocation: Record<string, Array<{id: string, name: string, userId: string}>>;
  totalActivePlayers: number;
  error?: string;
}

// Memoized location list item component
const LocationListItem = ({ 
  locationId, 
  location, 
  selectedLocation, 
  onLocationSelect 
}: {
  locationId: string;
  location: Location;
  selectedLocation: string | null;
  onLocationSelect: (id: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onLocationSelect(locationId);
  }, [locationId, onLocationSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        text-left p-4 rounded-lg border transition-all
        ${selectedLocation === locationId
          ? 'border-amber-400 bg-slate-700'
          : 'border-slate-600 hover:border-amber-600 bg-slate-700/50'
        }
      `}
    >
      <h3 className="font-medium text-amber-200">{location.name}</h3>
      <p className="text-sm text-slate-400">{location.region}</p>
      <div className="mt-2 flex gap-2 text-xs">
        <span className="text-green-400">{location.npcs.length} NPCs</span>
        <span className="text-purple-400">{location.objects.length} Objects</span>
      </div>
    </button>
  );
};

// Memoized cell component for better performance
const LocationCell = ({ 
  location, 
  locationId, 
  selectedLocation, 
  onLocationSelect, 
  getLocationTypeColor,
  playersInLocation = []
}: {
  location: Location;
  locationId: string;
  selectedLocation: string | null;
  onLocationSelect: (id: string) => void;
  getLocationTypeColor: (type: string) => string;
  playersInLocation?: Array<{id: string, name: string, userId: string}>;
}) => {
  const handleClick = useCallback(() => {
    onLocationSelect(locationId);
  }, [locationId, onLocationSelect]);

  const hasPlayers = playersInLocation.length > 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        size-16 rounded-lg border-2 transition-all relative
        ${getLocationTypeColor(location.type)}
        ${selectedLocation === locationId
          ? 'border-amber-400 scale-105'
          : hasPlayers 
            ? 'border-green-400 shadow-lg shadow-green-400/30'
            : 'border-slate-600 hover:border-amber-600'
        }
      `}
      title={`${location.name}${hasPlayers ? ` (${playersInLocation.length} player${playersInLocation.length > 1 ? 's' : ''})` : ''}`}
    >
      <div className="text-xs font-medium text-white text-center px-1">
        {location.name.split(' ')[0]}
      </div>
      {hasPlayers && (
        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {playersInLocation.length}
        </div>
      )}
    </button>
  );
};

export default function WorldVisualizer() {
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [playersByLocation, setPlayersByLocation] = useState<Record<string, Array<{id: string, name: string, userId: string}>>>({});
  const [totalActivePlayers, setTotalActivePlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // All hooks must be called before any conditional returns
  const { locations, selectedLoc, gridData } = useMemo(() => {
    if (!worldData) {
      return {
        locations: [],
        selectedLoc: null,
        gridData: {
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0,
          gridWidth: 1,
          gridHeight: 1
        }
      };
    }

    const entries = Object.entries(worldData.locations);
    const coords = entries.map(([_, loc]) => loc.coordinates);
    const minX = Math.min(...coords.map(c => c.x));
    const maxX = Math.max(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    const maxY = Math.max(...coords.map(c => c.y));

    return {
      locations: entries,
      selectedLoc: selectedLocation ? worldData.locations[selectedLocation] : null,
      gridData: {
        minX,
        maxX,
        minY,
        maxY,
        gridWidth: maxX - minX + 1,
        gridHeight: maxY - minY + 1
      }
    };
  }, [worldData, selectedLocation]);

  // Memoize color function
  const getLocationTypeColor = useCallback((type: string) => {
    const colors = {
      town: 'bg-blue-500',
      forest: 'bg-green-600',
      mountain: 'bg-gray-600',
      path: 'bg-yellow-600',
      dungeon: 'bg-red-600',
      cave: 'bg-purple-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-400';
  }, []);

  // Memoize location selection handler
  const handleLocationSelect = useCallback((locationId: string) => {
    setSelectedLocation(locationId);
  }, []);

  useEffect(() => {
    const fetchWorldData = async () => {
      try {
        const response = await fetch(`${WORLD_SERVER_URL}/api/world/data`);
        if (!response.ok) {
          throw new Error('Failed to fetch world data');
        }
        const result: WorldDataResponse = await response.json();
        if (result.success) {
          setWorldData(result.worldData);
          setPlayersByLocation(result.playersByLocation || {});
          setTotalActivePlayers(result.totalActivePlayers || 0);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWorldData();
    
    // Set up periodic refresh for player positions
    const interval = setInterval(fetchWorldData, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading world data...</div>
      </div>
    );
  }

  if (error || !worldData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error || 'No world data available'}</div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto pb-8">
        <h1 className="text-3xl font-bold mb-2 text-amber-300">
          {worldData.meta.name} - World Visualizer
        </h1>
        <div className="flex justify-between items-center mb-8">
          <p className="text-amber-200">{worldData.meta.description}</p>
          <div className="text-green-400 font-medium">
            {totalActivePlayers} Active Player{totalActivePlayers !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* World Map */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-300">World Map</h2>
              
                                    <div
                        className="grid gap-2 mx-auto"
                        style={{
                          gridTemplateColumns: `repeat(${gridData.gridWidth}, 1fr)`,
                          maxWidth: `${gridData.gridWidth * 80}px`
                        }}
                      >
                        {Array.from({ length: gridData.gridHeight }, (_, y) =>
                          Array.from({ length: gridData.gridWidth }, (_, x) => {
                            const actualX = gridData.minX + x;
                            const actualY = gridData.maxY - y; // Flip Y axis
                            const cellKey = `${actualX}-${actualY}`;

                            const location = locations.find(([_, loc]) =>
                              loc.coordinates.x === actualX && loc.coordinates.y === actualY
                            );

                            if (location) {
                              const [locationId, loc] = location;
                              return (
                                <LocationCell
                                  key={cellKey}
                                  location={loc}
                                  locationId={locationId}
                                  selectedLocation={selectedLocation}
                                  onLocationSelect={handleLocationSelect}
                                  getLocationTypeColor={getLocationTypeColor}
                                  playersInLocation={playersByLocation[locationId] || []}
                                />
                              );
                            }

                            return (
                              <div
                                key={cellKey}
                                className="size-16 bg-slate-700 rounded-lg opacity-30"
                              />
                            );
                          })
                        )}
                      </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-4 bg-blue-500 rounded" />
                  <span>Town</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 bg-green-600 rounded" />
                  <span>Forest</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 bg-gray-600 rounded" />
                  <span>Mountain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 bg-yellow-600 rounded" />
                  <span>Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 bg-green-500 rounded relative">
                    <div className="absolute -top-1 -right-1 bg-green-400 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold">!</div>
                  </div>
                  <span>Players Present</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-amber-300">Location Details</h2>
            
            {selectedLoc ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-amber-200">{selectedLoc.name}</h3>
                  <p className="text-sm text-slate-300 mb-2">{selectedLoc.region}</p>
                  <p className="text-slate-200">{selectedLoc.description}</p>
                </div>

                {selectedLocation && playersByLocation[selectedLocation]?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">
                      Active Players ({playersByLocation[selectedLocation].length})
                    </h4>
                    <div className="space-y-1">
                      {playersByLocation[selectedLocation].map((player) => (
                        <div key={player.id} className="text-sm">
                          <div className="text-green-300 font-medium">{player.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-amber-200 mb-2">Connections</h4>
                  <div className="space-y-1">
                                                {selectedLoc.connections.map(connId => (
                              <button
                                type="button"
                                key={connId}
                                onClick={() => setSelectedLocation(connId)}
                                className="block text-blue-400 hover:text-blue-300 text-sm"
                              >
                                → {worldData.locations[connId]?.name || connId}
                              </button>
                            ))}
                  </div>
                </div>

                {selectedLoc.npcs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">NPCs ({selectedLoc.npcs.length})</h4>
                    <div className="space-y-2">
                      {selectedLoc.npcs.map((npc) => (
                        <div key={npc.name} className="text-sm">
                          <div className="text-green-400">{npc.name}</div>
                          <div className="text-slate-400">{npc.type} • {npc.health} HP</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLoc.objects.length > 0 && (
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">Objects ({selectedLoc.objects.length})</h4>
                    <div className="space-y-2">
                      {selectedLoc.objects.map((obj) => (
                        <div key={obj.name} className="text-sm">
                          <div className="text-purple-400">{obj.name}</div>
                          <div className="text-slate-400">{obj.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Click on a location to see details</p>
            )}
          </div>
        </div>

        {/* Location List */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-amber-300">All Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {locations.map(([locationId, location]) => (
                      <LocationListItem
                        key={locationId}
                        locationId={locationId}
                        location={location}
                        selectedLocation={selectedLocation}
                        onLocationSelect={handleLocationSelect}
                      />
                    ))}
          </div>
        </div>
      </div>
    </div>
  );
} 