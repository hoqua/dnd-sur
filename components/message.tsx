'use client';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

// Type narrowing is handled by TypeScript's control flow analysis
// The AI SDK provides proper discriminated unions for tool calls

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const attachmentsFromMessage = message.parts?.filter(
    (part) => part.type === 'file',
  ) || [];

  useDataStream();

  return (
    <motion.div
      data-testid={`message-${message.role}`}
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      data-role={message.role}
    >
      {/* Flowing book-style text */}
      <div className="space-y-4">
        {(message.parts || []).map((part, index) => {
          const key = `${message.id}-${index}`;

          if (part.type === 'text') {
            return (
              <div key={key} className="leading-relaxed">
                {message.role === 'assistant' ? (
                  // Narrator text - like book paragraphs
                  <div className="font-serif text-lg leading-8 text-amber-100 mb-6">
                    {mode === 'view' ? (
                      <Markdown>{part.text}</Markdown>
                    ) : (
                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        regenerate={regenerate}
                      />
                    )}
                  </div>
                ) : (
                  // Player input - styled as quoted dialogue
                  <div className="my-6 border-l-4 border-amber-600/50 pl-6">
                    <div className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider mb-2 font-sans">
                      → You say:
                    </div>
                    <div className="font-serif text-amber-200 text-lg italic leading-relaxed">
                      &ldquo;{part.text}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Handle tool calls as narrative elements
          if ('toolName' in part && 'args' in part) {
            const toolPart = part as any;
            return (
              <div key={key} className="my-6">
                <div className="text-center">
                  <div className="inline-block bg-purple-900/20 border border-purple-500/30 rounded-lg px-6 py-3">
                    <div className="text-purple-300 text-sm font-serif italic">
                      ⚡ The arcane energies swirl as ancient magic takes hold...
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if ('result' in part && !('text' in part)) {
            const resultPart = part as any;
            return (
              <div key={key} className="my-6">
                <div className="text-center">
                  <div className="inline-block bg-emerald-900/20 border border-emerald-500/30 rounded-lg px-6 py-3">
                    <div className="text-emerald-300 text-sm font-serif italic">
                      ✨ The magic weaves reality anew...
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Subtle message actions on hover */}
      {!isReadonly && message.role === 'assistant' && (
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <MessageActions
            key={`action-${message.id}`}
            chatId={chatId}
            message={message}
            isLoading={isLoading}
          />
        </div>
      )}
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts || [], nextProps.message.parts || [])) return false;

    return false;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
