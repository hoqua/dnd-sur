"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.createUser = createUser;
exports.saveChat = saveChat;
exports.getChatByUserId = getChatByUserId;
exports.getChatById = getChatById;
exports.saveMessages = saveMessages;
exports.getMessagesByChatId = getMessagesByChatId;
exports.getMessageById = getMessageById;
exports.deleteMessagesByChatIdAfterTimestamp = deleteMessagesByChatIdAfterTimestamp;
exports.getMessageCountByUserId = getMessageCountByUserId;
exports.createPlayer = createPlayer;
exports.getPlayerByUserId = getPlayerByUserId;
exports.getPlayersInLocation = getPlayersInLocation;
exports.updatePlayerLocation = updatePlayerLocation;
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema_1 = require("./schema");
const utils_1 = require("./utils");
// biome-ignore lint: Forbidden non-null assertion.
const client = (0, postgres_1.default)(process.env.POSTGRES_URL);
const db = (0, postgres_js_1.drizzle)(client);
async function getUser(email) {
    return db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.email, email));
}
async function createUser(email, password) {
    const hashedPassword = (0, utils_1.generateHashedPassword)(password);
    return db.insert(schema_1.user).values({ email, password: hashedPassword });
}
async function saveChat({ id, userId, title = 'Chat', }) {
    return db.insert(schema_1.chat).values({
        id,
        createdAt: new Date(),
        userId,
        title,
        visibility: 'private',
    });
}
// Removed deleteChatById - users keep their single chat permanently
async function getChatByUserId({ id }) {
    const [userChat] = await db
        .select()
        .from(schema_1.chat)
        .where((0, drizzle_orm_1.eq)(schema_1.chat.userId, id))
        .limit(1);
    return userChat;
}
// Removed getChatsByUserId - each user has only one chat
async function getChatById({ id }) {
    const [selectedChat] = await db.select().from(schema_1.chat).where((0, drizzle_orm_1.eq)(schema_1.chat.id, id));
    return selectedChat;
}
async function saveMessages({ messages, }) {
    return db.insert(schema_1.message).values(messages);
}
async function getMessagesByChatId({ id }) {
    return db
        .select()
        .from(schema_1.message)
        .where((0, drizzle_orm_1.eq)(schema_1.message.chatId, id))
        .orderBy((0, drizzle_orm_1.asc)(schema_1.message.createdAt));
}
async function getMessageById({ id }) {
    return db.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.id, id));
}
async function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp, }) {
    const messagesToDelete = await db
        .select({ id: schema_1.message.id })
        .from(schema_1.message)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.message.chatId, chatId), (0, drizzle_orm_1.gte)(schema_1.message.createdAt, timestamp)));
    const messageIds = messagesToDelete.map((msg) => msg.id);
    if (messageIds.length > 0) {
        return db
            .delete(schema_1.message)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.message.chatId, chatId), (0, drizzle_orm_1.inArray)(schema_1.message.id, messageIds)));
    }
}
async function getMessageCountByUserId({ id, }) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [stats] = await db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.message)
        .innerJoin(schema_1.chat, (0, drizzle_orm_1.eq)(schema_1.message.chatId, schema_1.chat.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chat.userId, id), (0, drizzle_orm_1.gte)(schema_1.message.createdAt, twentyFourHoursAgo), (0, drizzle_orm_1.eq)(schema_1.message.role, 'user')));
    return stats?.count ?? 0;
}
// Player-related functions
async function createPlayer({ userId, name, characterClass, level = 1, health = 100, location = 'tavern' }) {
    const [newPlayer] = await db.insert(schema_1.player).values({
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
async function getPlayerByUserId({ userId }) {
    const [existingPlayer] = await db
        .select()
        .from(schema_1.player)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.player.userId, userId), (0, drizzle_orm_1.eq)(schema_1.player.isActive, true)))
        .limit(1);
    return existingPlayer || null;
}
async function getPlayersInLocation({ location }) {
    return await db
        .select()
        .from(schema_1.player)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.player.location, location), (0, drizzle_orm_1.eq)(schema_1.player.isActive, true)));
}
async function updatePlayerLocation({ playerId, location, }) {
    const [updatedPlayer] = await db
        .update(schema_1.player)
        .set({ location, updatedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(schema_1.player.id, playerId))
        .returning();
    return updatedPlayer;
}
