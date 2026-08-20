import argon2 from "argon2";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error(
    "ADMIN_USERNAME e ADMIN_PASSWORD sono obbligatori",
  );
}

const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
});

await prisma.user.upsert({
  where: {
    username,
  },
  update: {},
  create: {
    username,
    passwordHash,
  },
});

console.log(`User "${username}" creato/verificato`);

await prisma.$disconnect();