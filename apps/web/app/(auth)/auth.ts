import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { getUser, createUser, getChatByUserId, saveChat } from '@dnd-sur/database';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import { generateUUID } from '@/lib/utils';
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        if (!email || !password) {
          return null;
        }

        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: 'regular' };
      },
    }),
  ],
    callbacks: {
    async signIn({ user, account }) {
      // For social providers, ensure user exists in database
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) return false;
        
        let [dbUser] = await getUser(user.email);
        
        if (!dbUser) {
          await createUser(user.email, generateUUID());
          [dbUser] = await getUser(user.email);
        }
        user.id = dbUser.id;
        user.type = 'regular';
        
        const existingChat = await getChatByUserId({ id: dbUser.id });
        
        if (!existingChat) {
          await saveChat({
            id: generateUUID(),
            userId: dbUser.id,
          });
        }
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      return session;
    },
  },
});
