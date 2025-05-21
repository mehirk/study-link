import { Zero } from "@rocicorp/zero";
import { schema } from "../../../../zero-syncer/schema";

export const ZERO_SERVER = import.meta.env.VITE_ZERO_SERVER;

export const z = new Zero({
  userID: "anon",
  server: ZERO_SERVER,
  schema,
});
