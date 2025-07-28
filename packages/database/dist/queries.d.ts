import postgres from 'postgres';
import { type User, type DBMessage, type Player } from './schema';
export declare function getUser(email: string): Promise<Array<User>>;
export declare function createUser(email: string, password: string): Promise<postgres.RowList<never[]>>;
export declare function saveChat({ id, userId, title, }: {
    id: string;
    userId: string;
    title?: string;
}): Promise<postgres.RowList<never[]>>;
export declare function getChatByUserId({ id }: {
    id: string;
}): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    userId: string;
    visibility: "public" | "private";
}>;
export declare function getChatById({ id }: {
    id: string;
}): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    userId: string;
    visibility: "public" | "private";
}>;
export declare function saveMessages({ messages, }: {
    messages: Array<DBMessage>;
}): Promise<postgres.RowList<never[]>>;
export declare function getMessagesByChatId({ id }: {
    id: string;
}): Promise<{
    id: string;
    chatId: string;
    role: string;
    parts: unknown;
    attachments: unknown;
    createdAt: Date;
}[]>;
export declare function getMessageById({ id }: {
    id: string;
}): Promise<{
    id: string;
    chatId: string;
    role: string;
    parts: unknown;
    attachments: unknown;
    createdAt: Date;
}[]>;
export declare function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp, }: {
    chatId: string;
    timestamp: Date;
}): Promise<postgres.RowList<never[]> | undefined>;
export declare function getMessageCountByUserId({ id, }: {
    id: string;
}): Promise<number>;
export declare function createPlayer({ userId, name, characterClass, level, health, location }: {
    userId: string;
    name: string;
    characterClass: string;
    level?: number;
    health?: number;
    location?: string;
}): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    userId: string;
    characterClass: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    location: string;
    inventory: unknown;
    stats: unknown;
    updatedAt: Date;
    isActive: boolean;
}>;
export declare function getPlayerByUserId({ userId }: {
    userId: string;
}): Promise<Player | null>;
export declare function getPlayersInLocation({ location }: {
    location: string;
}): Promise<Player[]>;
export declare function updatePlayerLocation({ playerId, location, }: {
    playerId: string;
    location: string;
}): Promise<{
    id: string;
    userId: string;
    name: string;
    characterClass: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    location: string;
    inventory: unknown;
    stats: unknown;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}>;
