import { auth } from '@/app/(auth)/auth';
import { getChatByUserId } from '@dnd-sur/database';
import { ChatSDKError } from '@/lib/errors';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  // Get the user's single chat
  const chat = await getChatByUserId({
    id: session.user.id,
  });

  // Return as array for consistency with existing API
  return Response.json(chat ? [chat] : []);
}
