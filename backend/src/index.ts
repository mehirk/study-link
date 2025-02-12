import express, { Request, Response } from "express";
import "dotenv/config"
import cors from "cors"; //wanted to accept requests from frontend

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5174"
}));

app.get("/", (req: Request, res: Response) => {
    console.log("Hi from frontend");
    res.send("Hello, World! 🚀");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
