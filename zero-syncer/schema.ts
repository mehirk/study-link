import { ANYONE_CAN_DO_ANYTHING, definePermissions } from "@rocicorp/zero";
import { schema as generatedSchema, Schema } from "./generated/schema";

export const schema = generatedSchema;
export const permissions = definePermissions<unknown, Schema>(schema, () => ({
  comment: ANYONE_CAN_DO_ANYTHING,
  user: ANYONE_CAN_DO_ANYTHING,
  group: ANYONE_CAN_DO_ANYTHING,
  group_member: ANYONE_CAN_DO_ANYTHING,
  discussion: ANYONE_CAN_DO_ANYTHING,
  file: ANYONE_CAN_DO_ANYTHING,
}));
