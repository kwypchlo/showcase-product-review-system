import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `product-review-system_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).defaultNow(),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const products = createTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    rating: doublePrecision("rating").default(0).notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    image: varchar("image", { length: 255 }).notNull(),
  },
  (products) => ({
    idxName: index("idx_products_name").on(products.name),
    idxRating: index("idx_products_rating").on(products.rating),
    idxReviewCount: index("idx_products_review_count").on(products.reviewCount),
  }),
);

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviews = createTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    rating: smallint("rating").notNull(),
    content: text("content").notNull(),
    date: timestamp("date", { mode: "date" }).defaultNow().notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    authorId: varchar("author_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (reviews) => ({
    idxDate: index("idx_reviews_date").on(reviews.date),
    idxRating: index("idx_reviews_rating").on(reviews.rating),
    idxProductAuthor: unique("idx_reviews_product_author").on(reviews.productId, reviews.authorId),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  post: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  author: one(users, { fields: [reviews.authorId], references: [users.id] }),
}));
