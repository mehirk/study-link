import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { ZeroProvider } from "@rocicorp/zero/react";
import { z } from "@lib/zero/client.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ZeroProvider zero={z}>
        <App />
      </ZeroProvider>
    </QueryClientProvider>
  </StrictMode>
);
