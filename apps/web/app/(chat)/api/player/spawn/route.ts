import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { spawnPlayerOnLogin } from '@/lib/world/player-spawning';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await spawnPlayerOnLogin(session.user.id);
    
    return Response.json({ 
      success: result.success, 
      error: result.error || null 
    });
  } catch (error) {
    console.error('Error spawning player:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to spawn player' 
    }, { status: 500 });
  }
} 