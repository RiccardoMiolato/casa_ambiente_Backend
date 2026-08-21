import { hashPassword } from "../../../src/lib/auth/password";
import { prisma } from "../../../src/lib/prisma";

export const TEST_USERNAME = "test-user";
export const TEST_PASSWORD = "test-password-123";

export async function createTestUser() {
  const passwordHash = await hashPassword(TEST_PASSWORD);

  return prisma.user.create({
    data: {
      username: TEST_USERNAME,
      passwordHash,
    },
  });
}