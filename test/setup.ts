import { afterAll, beforeAll } from "bun:test";
import { prisma } from "../src/lib/prisma";

beforeAll(async () => {
  console.log("Test setup started");
});

afterAll(async () => {
  await prisma.$disconnect();
});