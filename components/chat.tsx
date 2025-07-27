'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ChatHeader } from '@/components/chat-header';
import { PlayerStats } from '@/components/player-stats';
import { LocationDisplay } from '@/components/location-display';
import { QuickActions } from '@/components/quick-actions';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';

import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';

import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

export function Chat({
  id,
  initialMessages,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  
  // Spawn player in world on login
  useEffect(() => {
    const spawnPlayer = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/player/spawn', { method: 'POST' });
          const result = await response.json();
          if (!result.success && result.error) {
            console.log(`ℹ️ Player spawn: ${result.error}`);
          }
        } catch (error) {
          console.error('Failed to spawn player:', error);
        }
      }
    };

    spawnPlayer();
  }, [session?.user?.id]);

  // Fetch player data (optimized refresh interval)
  const { data: playerData } = useSWR(
    session?.user?.id ? `/api/player/${session.user.id}` : null,
    fetcher,
    { 
      refreshInterval: 10000, // Reduced from 5s to 10s for better performance
      revalidateOnFocus: true,
    }
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),

            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      // Chat finished - no need to mutate chat history since there's only one chat per user
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  // Auto-greet new players without characters
  useEffect(() => {
    if (
      !hasAutoGreeted && 
      messages.length === 0 && 
      playerData !== undefined && 
      !playerData?.player &&
      !isReadonly
    ) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: 'Hello, I am new here.' }],
      });
      setHasAutoGreeted(true);
    }
  }, [hasAutoGreeted, messages.length, playerData, isReadonly, sendMessage]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="flex h-screen bg-black text-white">
        {/* Game-style Sidebar */}
        <div className="w-80 border-r border-amber-600/30 p-6 flex-shrink-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black shadow-2xl">
          <PlayerStats player={playerData?.player || null} />
        </div>

        {/* Main Adventure Area */}
        <div className="flex flex-col min-w-0 flex-1 bg-gradient-to-b from-slate-900 via-slate-800 to-black h-screen">
          <ChatHeader
            chatId={id}
            isReadonly={isReadonly}
            session={session}
          />

          {/* Adventure Text Area - Book Style */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-4xl mx-auto p-12">
              {/* Book header */}
              <div className="text-center mb-16 border-b border-amber-600/20 pb-8">
                <h1 className="text-3xl font-serif font-bold text-amber-200 mb-2">
                  Chronicles of the Realm
                </h1>
                <p className="text-amber-400/70 font-serif italic">
                  An Epic Adventure Unfolds...
                </p>
              </div>
              
              <Messages
                chatId={id}
                status={status}
                messages={messages}
                setMessages={setMessages}
                regenerate={regenerate}
                isReadonly={isReadonly}
              />
            </div>
          </div>

          {/* Command Input Area - Seamless Book Style */}
          <div className="bg-slate-900/90 backdrop-blur flex-shrink-0">
            <div className="max-w-4xl mx-auto p-6">
              {!isReadonly && (
                <>
                  <QuickActions append={sendMessage} isLoading={false} />
                  <MultimodalInput
                    chatId={id}
                    input={input}
                    setInput={setInput}
                    status={status}
                    stop={stop}
                    sendMessage={sendMessage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
