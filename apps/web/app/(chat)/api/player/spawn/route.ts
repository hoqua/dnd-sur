import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';

const WORLD_SERVER_URL = process.env.WORLD_SERVER_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${WORLD_SERVER_URL}/api/world/spawn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: session.user.id }),
  });
  
  const result = await response.json();
  
  return Response.json({ 
    success: result.success, 
    error: result.error || null 
  });
} 