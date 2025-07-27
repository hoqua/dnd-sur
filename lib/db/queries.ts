import 'server-only';

import {
  and,
  asc,
  count,
  eq,
  gte,
  inArray,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  message,
  type DBMessage,
  player,
  type Player,
} from './schema';
import { generateHashedPassword } from './utils';
import { ChatSDKError } from '../errors';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility: 'private',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(message).where(eq(message.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatByUserId({ id }: { id: string }) {
  try {
    const [userChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .limit(1);
    
    return userChat;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

// Player-related functions
export async function createPlayer({
  userId,
  name,
  characterClass,
}: {
  userId: string;
  name: string;
  characterClass: string;
}): Promise<Player> {
  try {
    const [newPlayer] = await db.insert(player).values({
      userId,
      name,
      characterClass,
      level: 1,
      health: 100,
      maxHealth: 100,
      experience: 0,
      location: 'Starting Village',
      inventory: [],
      stats: {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        constitution: 10,
        wisdom: 10,
        charisma: 10,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }).returning();
    
    return newPlayer;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create player');
  }
}

export async function getPlayerByUserId({ userId }: { userId: string }): Promise<Player | null> {
  try {
    const [existingPlayer] = await db
      .select()
      .from(player)
      .where(and(eq(player.userId, userId), eq(player.isActive, true)))
      .limit(1);
    
    return existingPlayer || null;
  } catch (error) {
    console.error('Database error in getPlayerByUserId:', error);
    // Return null instead of throwing error to prevent middleware crashes
    return null;
  }
}

export async function getPlayersInLocation({ location }: { location: string }): Promise<Player[]> {
  try {
    return await db
      .select()
      .from(player)
      .where(and(eq(player.location, location), eq(player.isActive, true)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get players in location',
    );
  }
}

export async function updatePlayerLocation({
  playerId,
  location,
}: {
  playerId: string;
  location: string;
}): Promise<Player> {
  try {
    const [updatedPlayer] = await db
      .update(player)
      .set({ location, updatedAt: new Date() })
      .where(eq(player.id, playerId))
      .returning();
    
    return updatedPlayer;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update player location',
    );
  }
}


