import { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Implement this middleware
  next();
};
