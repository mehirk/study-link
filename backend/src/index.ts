import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors"; //wanted to accept requests from frontend
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*", toNodeHandler(auth));

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello, World! 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
