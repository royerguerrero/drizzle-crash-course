import "dotenv/config";
import { db } from "./drizzle/db";
import { UserPreferencesTable, UserTable } from "./drizzle/schema";
import { sql } from "drizzle-orm";

async function main() {
  // const preference = await db.insert(UserPreferencesTable).values({
  //   userId: "22731ac2-2901-430a-80e5-2274427f95d2",
  //   emailUpdates: true
  // })
  // console.log(preference)
  const users = await db.query.UserTable.findMany({
    columns: { name: true, id: true },
    with: {
      posts: { with: { postCategories: true } },
    },
    orderBy: (table, funcs) => [funcs.asc(table.id)],
  });
  console.log(users);
}

main();
