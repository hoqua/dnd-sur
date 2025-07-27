import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { despawnPlayerOnLogout } from '@/lib/world/player-spawning';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    despawnPlayerOnLogout(session.user.id);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error despawning player:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to despawn player' 
    }, { status: 500 });
  }
} 