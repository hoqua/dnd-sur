"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.player = exports.message = exports.chat = exports.user = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.user = (0, pg_core_1.pgTable)('User', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    email: (0, pg_core_1.varchar)('email', { length: 64 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 64 }),
});
exports.chat = (0, pg_core_1.pgTable)('Chat', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    userId: (0, pg_core_1.uuid)('userId')
        .notNull()
        .references(() => exports.user.id),
    visibility: (0, pg_core_1.varchar)('visibility', { enum: ['public', 'private'] })
        .notNull()
        .default('private'),
});
exports.message = (0, pg_core_1.pgTable)('Message', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    chatId: (0, pg_core_1.uuid)('chatId')
        .notNull()
        .references(() => exports.chat.id),
    role: (0, pg_core_1.varchar)('role').notNull(),
    parts: (0, pg_core_1.json)('parts').notNull(),
    attachments: (0, pg_core_1.json)('attachments').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
});
exports.player = (0, pg_core_1.pgTable)('Player', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    userId: (0, pg_core_1.uuid)('userId')
        .notNull()
        .references(() => exports.user.id),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull(),
    characterClass: (0, pg_core_1.varchar)('characterClass', { length: 30 }).notNull(),
    level: (0, pg_core_1.integer)('level').notNull().default(1),
    health: (0, pg_core_1.integer)('health').notNull().default(100),
    maxHealth: (0, pg_core_1.integer)('maxHealth').notNull().default(100),
    experience: (0, pg_core_1.integer)('experience').notNull().default(0),
    location: (0, pg_core_1.varchar)('location', { length: 100 }).notNull().default('Starting Village'),
    inventory: (0, pg_core_1.json)('inventory').notNull().default([]),
    stats: (0, pg_core_1.json)('stats').notNull().default({}),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull().default(new Date()),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').notNull().default(new Date()),
    isActive: (0, pg_core_1.boolean)('isActive').notNull().default(true),
});
