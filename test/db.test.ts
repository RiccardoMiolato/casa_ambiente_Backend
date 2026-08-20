import { afterAll, expect, test } from "bun:test";
import { prisma } from "../src/lib/prisma";

test("Prisma usa il database di test", async () => {
  const result = await prisma.$queryRaw<
    { current_database: string }[]
  >`SELECT current_database()`;

  expect(result[0].current_database).toBe(
    "casa_ambiente_test",
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});