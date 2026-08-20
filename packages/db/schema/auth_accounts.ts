import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from './users';

export const authAccounts = pgTable(
  'auth_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('provider_provider_account_id_unique').on(table.provider, table.providerAccountId),
  ]
);

export type AuthAccount = InferSelectModel<typeof authAccounts>;
export type NewAuthAccount = InferInsertModel<typeof authAccounts>;
