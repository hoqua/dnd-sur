import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const player = pgTable('Player', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  name: varchar('name', { length: 50 }).notNull(),
  characterClass: varchar('characterClass', { length: 30 }).notNull(),
  level: integer('level').notNull().default(1),
  health: integer('health').notNull().default(100),
  maxHealth: integer('maxHealth').notNull().default(100),
  experience: integer('experience').notNull().default(0),
  location: varchar('location', { length: 100 }).notNull().default('Starting Village'),
  inventory: json('inventory').notNull().default([]),
  stats: json('stats').notNull().default({}),
  createdAt: timestamp('createdAt').notNull().default(new Date()),
  updatedAt: timestamp('updatedAt').notNull().default(new Date()),
  isActive: boolean('isActive').notNull().default(true),
});

export type Player = InferSelectModel<typeof player>;
