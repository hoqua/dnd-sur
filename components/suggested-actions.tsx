'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';

import type { ChatMessage } from '@/lib/types';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
}

function PureSuggestedActions({
  chatId,
  sendMessage,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Create a Warrior',
      label: 'Master of blade and shield',
      action: 'I want to create a brave warrior character named Thorin',
      icon: '⚔️',
    },
    {
      title: 'Create a Mage',
      label: 'Wielder of arcane magic',
      action: 'I want to create a wise mage character named Merlin',
      icon: '🔮',
    },
    {
      title: 'Create a Rogue',
      label: 'Master of stealth and precision',
      action: 'I want to create a cunning rogue character named Shadow',
      icon: '🗡️',
    },
    {
      title: 'Begin Adventure',
      label: 'Start your epic journey',
      action: 'I am ready to begin my adventure! Please help me create my character.',
      icon: '✨',
    },
  ];

  return (
    <div className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        className="text-center mb-12"
      >
        <div className="w-32 h-0.5 bg-amber-600/50 mx-auto mb-6"></div>
        <h3 className="text-2xl font-serif font-bold text-amber-200 mb-3">
          Choose Your Path Forward
        </h3>
        <p className="text-amber-400/70 font-serif italic">
          Four paths diverge before you, each leading to a different destiny...
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 2.5 + (0.15 * index), duration: 0.6 }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);
                sendMessage({
                  role: 'user',
                  parts: [{ type: 'text', text: suggestedAction.action }],
                });
              }}
              className="w-full h-auto p-8 bg-slate-800/30 hover:bg-slate-700/50 border border-amber-600/20 hover:border-amber-500/40 rounded-lg transition-all duration-500 group text-left"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {suggestedAction.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-serif font-bold text-amber-200 mb-2">
                      {suggestedAction.title}
                    </h4>
                    <p className="text-amber-400/80 font-serif leading-relaxed">
                      {suggestedAction.label}
                    </p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-amber-600/20 group-hover:bg-amber-500/30 transition-colors duration-300"></div>
                
                <p className="text-sm font-serif italic text-amber-500/70 group-hover:text-amber-400/90 transition-colors duration-300">
                  &ldquo;Click to begin this path...&rdquo;
                </p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;


    return true;
  },
);
