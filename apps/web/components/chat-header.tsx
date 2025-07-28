'use client';

import type { Session } from 'next-auth';
import { SignOutForm } from './sign-out-form';

export function ChatHeader({
  session,
  isReadonly,
}: {
  chatId: string;
  session: Session;
  isReadonly: boolean;
}) {
  return (
    <header className="border-b border-amber-600/30 bg-slate-900/90 backdrop-blur-sm">
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🏰</div>
          <div>
            <h1 className="text-2xl font-bold text-amber-200 tracking-wide">
              ADVENTURE REALM
            </h1>
            <p className="text-amber-400/80 text-sm font-medium">
              ⚡ Narrated by AI Dungeon Master
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-amber-300/80 text-sm">
            <span className="text-amber-500">Adventurer:</span>{' '}
            <span className="font-medium text-amber-200">{session.user?.email}</span>
          </div>
          <SignOutForm />
        </div>
      </div>
    </header>
  );
}
