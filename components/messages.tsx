import { motion } from 'framer-motion';
import { Greeting } from './greeting';
import { PreviewMessage } from './message';
import { useMessages } from '@/hooks/use-messages';
import { ThinkingMessage } from './message';

import { useDataStream } from './data-stream-provider';
import type { ChatMessage } from '@/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';

export interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<ChatMessage>['status'];
  messages: Array<ChatMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
  isReadonly,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  useDataStream();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 pt-4 relative"
    >
      {messages.length === 0 && <Greeting />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = PureMessages;
