import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { ZeroProvider } from "@rocicorp/zero/react";
import { z } from "@lib/zero/client.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from "posthog-js/react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        ui_host: "https://us.posthog.com",
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ZeroProvider zero={z}>
          <App />
        </ZeroProvider>
      </QueryClientProvider>
    </PostHogProvider>
  </StrictMode>
);
