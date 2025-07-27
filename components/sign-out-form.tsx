'use client';

import { signOut, useSession } from 'next-auth/react';

export const SignOutForm = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    // Clean up player from world
    if (session?.user?.id) {
      try {
        await fetch('/api/player/despawn', { method: 'POST' });
      } catch (error) {
        console.error('Failed to cleanup player:', error);
      }
    }
    
    await signOut({ redirectTo: '/login' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left px-1 py-0.5 text-red-500"
    >
      Sign out
    </button>
  );
};
