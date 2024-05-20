import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  timestamp,
  unique,
  uuid,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("user_role", ["ADMIN", "BASIC"]);

export const UserTable = pgTable(
  "users",
  {
    //  defaultRandom() is only available for uuid fields and create a random uuid
    id: uuid("id").primaryKey().defaultRandom(),
    //  serial is the way to create an autoincrement field
    //   id: serial().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: UserRole("user_role").notNull().default("BASIC"),
  },
  (table) => {
    return {
      emailIndex: index("email_index").on(table.email),
      uniqueNameAndAge: unique("unique_name_and_age").on(table.name, table.age),
    };
  }
);

export const UserPreferencesTable = pgTable("users_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailUpdates: boolean("email_updates").notNull().default(false),
  userId: uuid("user_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const PostTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  averageRating: real("average_rating").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  authorId: uuid("author_id")
    .references(() => UserTable.id)
    .notNull(),
});

export const CategoryTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const PostCategoryTable = pgTable(
  "posts_categories",
  {
    postId: uuid("post_id")
      .references(() => PostTable.id)
      .notNull(),
    categoryId: uuid("category_id")
      .references(() => CategoryTable.id)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.postId, table.categoryId] }),
    };
  }
);

//  Relationships
export const UserTableRelations = relations(UserTable, ({ one, many }) => {
  return {
    preferences: one(UserPreferencesTable),
    posts: many(PostTable),
  };
});

export const UserPreferencesTableRelations = relations(
  UserPreferencesTable,
  ({ one }) => {
    return {
      user: one(UserTable, {
        fields: [UserPreferencesTable.userId],
        references: [UserTable.id],
      }),
    };
  }
);

export const PostTableRelations = relations(PostTable, ({ one, many }) => {
  return {
    user: one(UserTable, {
      fields: [PostTable.authorId],
      references: [UserTable.id],
    }),
    postCategories: many(PostCategoryTable),
  };
});

export const CategoryTableRelations = relations(CategoryTable, ({ many }) => {
  return {
    posts: many(PostCategoryTable),
  };
});

export const PostCategoryTableRelations = relations(
  PostCategoryTable,
  ({ one }) => {
    return {
      post: one(PostTable, {
        fields: [PostCategoryTable.postId],
        references: [PostTable.id],
      }),
      category: one(CategoryTable, {
        fields: [PostCategoryTable.categoryId],
        references: [CategoryTable.id],
      }),
    };
  }
);
