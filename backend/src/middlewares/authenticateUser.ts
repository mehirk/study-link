import { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth";

// Define interface to extend Request type with user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    emailVerified?: boolean;
  };
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }
    
    // Set user ID on request object (placeholder implementation)
    (req as AuthenticatedRequest).user = {
      id: "user-id-from-token", // Replace with actual token validation
    };
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};
