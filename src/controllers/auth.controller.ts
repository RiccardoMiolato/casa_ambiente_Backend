import type { Request, Response } from "express";
import { verifyPassword } from "../lib/auth/password";
import {
    createSession,
    deleteSession,
} from "../lib/auth/session";
import { prisma } from "../lib/prisma";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      error: "Username e password sono obbligatori",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(401).json({
      error: "Credenziali non valide",
    });
  }

  const validPassword = await verifyPassword(
    password,
    user.passwordHash,
  );

  if (!validPassword) {
    return res.status(401).json({
      error: "Credenziali non valide",
    });
  }

  const { sessionId, expiresAt } =
    await createSession(user.id);

  res.cookie(
    "sessionId",
    sessionId,
    {
      ...cookieOptions,
      expires: expiresAt,
    },
  );

  return res.json({
    user: {
      id: user.id,
      username: user.username,
    },
  });
}

export async function logout(req: Request, res: Response) {
  const sessionId = req.cookies?.sessionId;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.clearCookie("sessionId", cookieOptions);

  return res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = res.locals.user;

  return res.json({
    id: user.id,
    username: user.username,
  });
}