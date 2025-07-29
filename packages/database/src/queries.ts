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

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!, {
  max: 20,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 30,
  ssl: 'require',
  onnotice: () => {},
});
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  return db.select().from(user).where(eq(user.email, email));
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);
  return db.insert(user).values({ email, password: hashedPassword });
}

export async function saveChat({
  id,
  userId,
  title = 'Chat',
}: {
  id: string;
  userId: string;
  title?: string;
}) {
  return db.insert(chat).values({
    id,
    createdAt: new Date(),
    userId,
    title,
    visibility: 'private',
  });
}

// Removed deleteChatById - users keep their single chat permanently

export async function getChatByUserId({ id }: { id: string }) {
  const [userChat] = await db
    .select()
    .from(chat)
    .where(eq(chat.userId, id))
    .limit(1);
  
  return userChat;
}

// Removed getChatsByUserId - each user has only one chat

export async function getChatById({ id }: { id: string }) {
  const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
  return selectedChat;
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  return db.insert(message).values(messages);
}

export async function getMessagesByChatId({ id }: { id: string }) {
  return db
    .select()
    .from(message)
    .where(eq(message.chatId, id))
    .orderBy(asc(message.createdAt));
}

export async function getMessageById({ id }: { id: string }) {
  return db.select().from(message).where(eq(message.id, id));
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  const messagesToDelete = await db
    .select({ id: message.id })
    .from(message)
    .where(
      and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
    );

  const messageIds = messagesToDelete.map((msg) => msg.id);

  if (messageIds.length > 0) {
    return db
      .delete(message)
      .where(
        and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
      );
  }
}

export async function getMessageCountByUserId({
  id,
}: {
  id: string;
}): Promise<number> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [stats] = await db
    .select({ count: count() })
    .from(message)
    .innerJoin(chat, eq(message.chatId, chat.id))
    .where(
      and(
        eq(chat.userId, id),
        gte(message.createdAt, twentyFourHoursAgo),
        eq(message.role, 'user'),
      ),
    );

  return stats?.count ?? 0;
}

// Player-related functions
export async function createPlayer({
  userId,
  name,
  characterClass,
  level = 1,
  health = 100,
  location = 'cell_0_0'
}: {
  userId: string;
  name: string;
  characterClass: string;
  level?: number;
  health?: number;
  location?: string;
}) {
  const [newPlayer] = await db.insert(player).values({
    userId,
    name,
    characterClass,
    level,
    health,
    location,
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  }).returning();
  
  return newPlayer;
}

export async function getPlayerByUserId({ userId }: { userId: string }): Promise<Player | null> {
  const [existingPlayer] = await db
    .select()
    .from(player)
    .where(and(eq(player.userId, userId), eq(player.isActive, true)))
    .limit(1);
    
  return existingPlayer || null;
}

export async function getPlayersInLocation({ location }: { location: string }): Promise<Player[]> {
  return await db
    .select()
    .from(player)
    .where(and(eq(player.location, location), eq(player.isActive, true)));
}

export async function updatePlayerLocation({
  playerId,
  location,
}: {
  playerId: string;
  location: string;
}) {
  const [updatedPlayer] = await db
    .update(player)
    .set({ location, updatedAt: new Date() })
    .where(eq(player.id, playerId))
    .returning();
  
  return updatedPlayer;
}