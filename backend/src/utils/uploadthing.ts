import { createUploadthing, type FileRouter } from "uploadthing/express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import { UploadThingError } from "uploadthing/server";
const f = createUploadthing();

export const uploadRouter = {
  profilePicture: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete((data) => console.log("file", data)),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
