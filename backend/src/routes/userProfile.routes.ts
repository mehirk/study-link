import { Router, Request, Response } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { User } from "better-auth/types";
import prisma from "../utils/prisma";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const router = Router();

router.get(
  "/",
  authenticateUser,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: { userId },
          },
        },
      });

      res.status(200).json({ user: req.user, groups });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update user profile
router.put(
  "/",
  authenticateUser,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { name, image } = req.body;

      // Validate input
      if (!name && !image) {
        res.status(400).json({ message: "No fields to update provided" });
        return;
      }

      // Create update object with only provided fields
      const updateData: { name?: string; image?: string } = {};
      if (name) updateData.name = name;
      if (image) updateData.image = image;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete user account
router.delete(
  "/",
  authenticateUser,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        // Delete user and rely on Prisma's cascading deletes
        // If cascade doesn't work, this is a safer approach that will still delete the user
        await prisma.user.delete({
          where: { id: userId },
        });

        res.status(200).json({ message: "User account deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user account" });
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
