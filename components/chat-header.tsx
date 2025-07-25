'use client';

import { Button } from '@/components/ui/button';
import { UserIcon } from './icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOutForm } from '@/components/sign-out-form';

import { memo } from 'react';
import type { Session } from 'next-auth';

function PureChatHeader({
  chatId,
  isReadonly,
  session,
}: {
  chatId: string;
  isReadonly: boolean;
  session: Session;
}) {

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      
      <div className="flex items-center gap-2 ml-auto">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <UserIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuItem disabled className="font-medium">
              {session.user?.email || 'User'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <SignOutForm />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader);
