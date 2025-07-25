'use client';

import cx from 'classnames';
import { useRef, useEffect, useCallback, useState } from 'react';
import { StopIcon, ArrowUpIcon } from './icons';
import { Button } from './ui/button';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';

export function MultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  sendMessage,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { scrollToBottom } = useScrollToBottom();
  const [isTransforming, setIsTransforming] = useState(false);

  const submitForm = useCallback(async () => {
    if (!input.trim() || isTransforming) return;

    const originalInput = input.trim();
    setIsTransforming(true);
    setInput(''); // Clear input immediately

    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Transform text and send message
    let messageText = originalInput;
    try {
      const response = await fetch('/api/transform-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalInput }),
      });
      
      if (response.ok) {
        const { transformed } = await response.json();
        if (transformed) messageText = transformed;
      }
    } catch (error) {
      // Use original text if transformation fails
    }

    // Send message (original or transformed)
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: messageText }],
    });

    setIsTransforming(false);
    scrollToBottom();
  }, [input, sendMessage, setInput, scrollToBottom, chatId, isTransforming]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (input.trim() && !isTransforming) {
        submitForm();
      }
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        data-testid="multimodal-input"
        value={input}
        onChange={handleInput}
        onInput={adjustHeight}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full resize-none bg-transparent px-0 py-4 text-amber-100 placeholder:text-amber-400/60 focus:outline-none focus:ring-0 transition-all duration-200 font-serif text-lg leading-relaxed border-0',
          isTransforming && 'opacity-50',
          className,
        )}
        placeholder={isTransforming ? "✨ Crafting perfect words..." : "Type anything, it will be made proper..."}
        rows={2}
        autoFocus
        disabled={isTransforming}
      />

      <div className="absolute bottom-2 right-2">
        {status === 'submitted' ? (
          <StopButton stop={stop} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            isTransforming={isTransforming}
          />
        )}
      </div>
    </div>
  );
}

function StopButton({
  stop,
}: {
  stop: () => void;
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-2 h-fit bg-red-800/50 border border-red-600/30 hover:bg-red-700/70 text-red-300"
      onClick={(event) => {
        event.preventDefault();
        stop();
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

function SendButton({
  submitForm,
  input,
  isTransforming,
}: {
  submitForm: () => void;
  input: string;
  isTransforming: boolean;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-2 h-fit bg-emerald-800/50 border border-emerald-600/30 hover:bg-emerald-700/70 text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      onClick={(event) => {
        event.preventDefault();
        if (!isTransforming) {
          submitForm();
        }
      }}
      disabled={input.length === 0 || isTransforming}
    >
      {isTransforming ? (
        <div className="animate-spin rounded-full h-3.5 w-3.5 border border-emerald-400 border-t-transparent" />
      ) : (
        <ArrowUpIcon size={14} />
      )}
    </Button>
  );
}
