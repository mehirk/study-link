// schema.ts
import {
  createSchema,
  table,
  string,
  ANYONE_CAN_DO_ANYTHING,
  definePermissions,
} from "@rocicorp/zero";

const message = table("message")
  .columns({
    id: string(),
    body: string(),
  })
  .primaryKey("id");

export const schema = createSchema({
  tables: [message],
});

export type Schema = typeof schema;

export const permissions = definePermissions<unknown, Schema>(schema, () => ({
  message: ANYONE_CAN_DO_ANYTHING,
}));
