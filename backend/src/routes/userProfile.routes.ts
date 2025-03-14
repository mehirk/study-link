import { Router, Request, Response } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";

const router = Router();

// Get user profile
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  // TODO: Implement this function
});

// Update user profile
router.put("/", authenticateUser, async (req: Request, res: Response) => {
  // TODO: Implement this function
});

// Delete user account
router.delete("/", authenticateUser, async (req: Request, res: Response) => {
  // TODO: Implement this function
});

export default router;
