import express from "express";
import "dotenv/config";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";
import userProfileRoutes from "./routes/user-profile.routes";
import groupRoutes from "./routes/group.routes";
import { uploadRouter } from "./utils/uploadthing";
import { createRouteHandler } from "uploadthing/express";
import discussionRoutes from "./routes/discussion.routes";
import filesRoutes from "./routes/files.routes";
import client from "prom-client";
import metricsMiddleware from "./middlewares/metrics";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? [
          process.env.FRONTEND_URL,
          "http://localhost:5173",
          "http://10.0.0.47:5173",
          /^https:\/\/.*shahbazs-projects-0c71becb\.vercel\.app$/,
        ]
      : ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(metricsMiddleware);

app.all("/api/auth/*authPath", toNodeHandler(auth));

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);

app.use(express.json());

app.use("/profile", userProfileRoutes);
app.use("/groups", groupRoutes);
app.use("/discussions", discussionRoutes);
app.use("/files", filesRoutes);

app.get("/", (req, res) => {
  res.send("Backend is Running 🚀");
});

app.get("/metrics", async (req, res) => {
  const metrics = await client.register.metrics();
  res.set("Content-Type", client.register.contentType);
  res.end(metrics);
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
