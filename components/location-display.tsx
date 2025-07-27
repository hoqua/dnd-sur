import { useSession } from 'next-auth/react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LocationDisplay() {
  const { data: session } = useSession();
  
  const { data: playerData } = useSWR(
    session?.user?.id ? `/api/player/${session.user.id}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  );

  if (!session?.user || !playerData?.worldState?.currentLocation) {
    return null;
  }

  const { currentLocation, playersInLocation } = playerData.worldState;
  const otherPlayers = playersInLocation.filter((p: any) => p.id !== session.user.id);

  return (
    <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-amber-300">{currentLocation.name}</h3>
        <span className="text-xs text-amber-600 bg-amber-900/30 px-2 py-1 rounded">
          {currentLocation.type} • Difficulty {currentLocation.difficulty}
        </span>
      </div>
      
      <p className="text-sm text-amber-100/80 mb-3">{currentLocation.description}</p>
      
      <div className="flex flex-wrap gap-4 text-xs">
        {currentLocation.npcs && currentLocation.npcs.length > 0 && (
          <div className="text-amber-400">
            <span className="font-medium">NPCs:</span> {currentLocation.npcs.length}
          </div>
        )}
        
        {currentLocation.objects && currentLocation.objects.length > 0 && (
          <div className="text-amber-400">
            <span className="font-medium">Objects:</span> {currentLocation.objects.length}
          </div>
        )}
        
        {otherPlayers.length > 0 && (
          <div className="text-blue-400">
            <span className="font-medium">Players:</span> {otherPlayers.length}
          </div>
        )}
      </div>
    </div>
  );
} 