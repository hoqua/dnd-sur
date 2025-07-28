

import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import { getChatByUserId, saveChat } from '@dnd-sur/database';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Get the user's single chat
  let userChat = await getChatByUserId({ id: session.user.id });
  
  // If no chat exists, create one automatically
  if (!userChat) {
    const chatId = generateUUID();
    await saveChat({
      id: chatId,
      userId: session.user.id,
      title: 'New Chat',
    });
    
    // Get the newly created chat
    userChat = await getChatByUserId({ id: session.user.id });
  }
  
  if (userChat) {
    // Redirect to the user's chat
    redirect(`/chat/${userChat.id}`);
  }

  // This should never happen now, but keep as fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">Setting up your chat...</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Creating your chat interface...
      </p>
    </div>
  );
}
