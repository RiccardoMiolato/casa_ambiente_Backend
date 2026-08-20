import type { NextFunction, Request, Response } from "express";
import { getSession } from "../lib/auth/session";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      res.clearCookie("sessionId");

      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    res.locals.user = session.user;
    res.locals.session = session;

    next();
  } catch (error) {
    next(error);
  }
}