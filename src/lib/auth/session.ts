import crypto from "node:crypto";
import { prisma } from "../prisma";

const SESSION_DURATION_DAYS = 30;

export async function createSession(userId: string) {
  const sessionId = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + SESSION_DURATION_DAYS,
  );

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  return {
    sessionId,
    expiresAt,
  };
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId);

    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string) {
  await prisma.session.deleteMany({
    where: {
      id: sessionId,
    },
  });
}