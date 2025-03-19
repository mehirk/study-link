import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import prisma from "./prisma";
import { z } from "zod";
const f = createUploadthing();

export const uploadRouter = {
  profilePicture: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .input(z.object({ userId: z.string(), token: z.string() }))
    .middleware(async ({ input }) => {
      const session = await prisma.session.findUnique({
        where: {
          token: input.token,
        },
      });

      if (!session) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: input.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          image: file.ufsUrl,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
