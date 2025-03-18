import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../middlewares/authenticateUser";
import { AuthenticatedRequest } from "./userProfile.routes";

const router = Router();
const prisma = new PrismaClient();

router.get(
  "/",
  authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: { userId: req.user?.id as string },
          },
        },
      });
      res.status(200).json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/",
  authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      console.log("req.user?.id", req.user?.id);
      const group = await prisma.group.create({
        data: {
          name,
          description,
        },
      });
      await prisma.groupMember.create({
        data: {
          userId: req.user?.id as string,
          groupId: group.id,
          role: "ADMIN",
        },
      });
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/add-member",
  authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { groupId, userId } = req.body;

      // Check if user is already a member of the group
      const existingMember = await prisma.groupMember.findFirst({
        where: {
          userId,
          groupId,
        },
      });

      if (existingMember) {
        res
          .status(400)
          .json({ message: "User is already a member of the group" });
        return;
      }

      // Add user to group
      await prisma.groupMember.create({
        data: {
          userId,
          groupId,
          role: "MEMBER",
        },
      });

      res.status(201).json({ message: "User added to group successfully" });
    } catch (error) {
      console.error("Error adding user to group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Test later
// router.put(
//   "/:id",
//   authenticateUser,
//   async (req: AuthenticatedRequest, res: Response) => {
//     try {
//       const { id } = req.params;
//       const { name, description } = req.body;
//       const group = await prisma.group.update({
//         where: { id: parseInt(id) },
//         data: { name, description },
//       });
//       res.status(200).json(group);
//     } catch (error) {
//       console.error("Error updating group:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// router.delete(
//   "/:id",
//   authenticateUser,
//   async (req: AuthenticatedRequest, res: Response) => {
//     try {
//       const { id } = req.params;
//       await prisma.group.delete({ where: { id: parseInt(id) } });
//       res.status(204).json({ message: "Group deleted successfully" });
//     } catch (error) {
//       console.error("Error deleting group:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

export default router;
