import { afterAll, beforeAll, expect, test } from "bun:test";
import { verifyPassword } from "../../src/lib/auth/password";
import { prisma } from "../../src/lib/prisma";
import { createTestUser, TEST_PASSWORD, TEST_USERNAME } from "../utils/helpers/test-user";

beforeAll(async () => {
    await createTestUser();
});

test("test user exists", async () => {
    const user = await prisma.user.findUnique({
        where: {
            username: TEST_USERNAME,
        },
    });

    expect(user).not.toBeNull();
    expect(user?.username).toBe(TEST_USERNAME);
    expect(user?.passwordHash).toBeTruthy();
    });

    afterAll(async () => {
    await prisma.$disconnect();
});

test("test user exists with valid password", async () => {
    const user = await prisma.user.findUnique({
      where: {
        username: TEST_USERNAME,
      },
    });

    expect(user).not.toBeNull();

    const validPassword = await verifyPassword(
        TEST_PASSWORD,
        user!.passwordHash,
    );

    expect(validPassword).toBe(true);
});