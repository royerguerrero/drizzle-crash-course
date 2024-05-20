# Learning Drizzle

- drizzle.config.ts -> File configuration this can be moved to infrastructure layer in a clean architecture
- generate migrations -> `npx drizzle-kit generate`
- drop migration -> `npx drizzle-kit drop`
- drizzle studio -> `npx drizzle-kit studio`
- enable the logs for the client -> `export const db = drizzle(client, { schema, logger: true });`
- insert record -> `await db.insert(UserTable).values({ name: "Roy" });`
- for create index for a field that is unique. We can use `uniqueIndex` instead of `index`. Example

```ts

import {uniqueIndex, varchar, pgTable} from "drizzle/pg-core";

export const userTable = pgTable({
    ...
    //  email: varchar("email", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    ...
}, table => {
    return {
        //  emailIndex: index("email_index").on(table.email)
        emailIndex: uniqueIndex("email_index").on(table.email)
    }
})

```

- Set a default value

```ts
import {integer, pgTable} from "drizzle/pg-core";

export const userTable = pgTable({
    ...
    age: integer("age").notNull().$default(() => Math.random())
    ...
})
```

- Overwrite a type. NOTE: Useful for JSON columns for specify what the data actually represents

```ts
import {integer, pgTable} from "drizzle/pg-core";

export const userTable = pgTable({
    ...
    age: integer("age").notNull().$type<22 | 34>()
    ...
})
```

- Insert data

```ts
import "dotenv/config";
import { db } from "./drizzle/db";
import { UserTable } from "./drizzle/schema";

async function main() {
  await db.delete(UserTable);
  const user = await db
    .insert(UserTable)
    .values([
      {
        name: "royer",
        age: 22,
        email: "royer.guerrero@gmail.com",
      },
      {
        name: "Ana",
        age: 23,
        email: "ana@gataganster.com",
      },
    ])
    .returning({
      id: UserTable.id,
    })
    .onConflictDoUpdate({
      target: UserTable.email,
      set: { name: "Updated Name" },
    });

  console.log(user);
}

main();
```

- Relations: The relationship don't require for the migrations to work is only for drizzle-orm

```ts
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
    postCategories: many(CategoryTable),
  };
});

export const CategoryTableRelations = relations(CategoryTable, ({ many }) => {
  return {
    posts: many(PostTable),
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
```
