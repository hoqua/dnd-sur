import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getPlayerByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // Users can only fetch their own player data
    if (session.user.id !== userId) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    const player = await getPlayerByUserId({ userId });

    return Response.json({ player }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch player data:', error);
    
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    
    return new ChatSDKError('offline:chat').toResponse();
  }
} 