import type { NextRequest } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { getPlayerByUserId } from '@dnd-sur/database';
const WORLD_SERVER_URL = process.env.WORLD_SERVER_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await params before accessing properties (Next.js 15 requirement)
  const { userId } = await params;

  // Users can only access their own data
  if (session.user.id !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get player data from database
  const player = await getPlayerByUserId({ userId });
  
  // Get player's world state from server (optional - don't fail if world server is down)
  let worldState = null;
  try {
    const response = await fetch(`${WORLD_SERVER_URL}/api/world/player/${userId}/state`);
    if (response.ok) {
      const result = await response.json();
      worldState = result.success ? result : null;
    }
  } catch (error) {
    console.warn('Failed to get world state from server:', error);
  }

  return Response.json({ 
    player: player || null,
    worldState,
  });
} 