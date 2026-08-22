import { pgTable, uuid, varchar, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const documentStatusEnum = pgEnum('document_status', ['uploaded', 'processing', 'ready', 'failed']);

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  status: documentStatusEnum('status').default('uploaded').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;
