import { createAuthClient } from "better-auth/react";
export const BACKEND_BASE_URL = "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: BACKEND_BASE_URL,
});
