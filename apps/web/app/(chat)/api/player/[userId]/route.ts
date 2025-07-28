import type { NextRequest } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { getPlayerByUserId } from '@dnd-sur/database';
import { getPlayerWorldState } from '@/lib/world/player-spawning';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { userId } = await params;

    // Users can only access their own data
    if (session.user.id !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get player data from database
    const player = await getPlayerByUserId({ userId });
    
    // Get player's world state
    const worldState = getPlayerWorldState(userId);

    return Response.json({ 
      player: player || null,
      worldState: worldState || null,
    });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 