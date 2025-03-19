import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./env";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

// For new code using axios
import axios from "axios";
import { API_URL } from "./env";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default apiClient;
