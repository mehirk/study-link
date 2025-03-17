import { createUploadthing, type FileRouter } from "uploadthing/express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import { UploadThingError } from "uploadthing/server";
import prisma from "./prisma";
import { z } from "zod";
const f = createUploadthing();

export const uploadRouter = {
  profilePicture: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .input(z.object({ userId: z.string() }))
    .middleware(async ({ input, req }) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: input.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const user = await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          image: file.ufsUrl,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
