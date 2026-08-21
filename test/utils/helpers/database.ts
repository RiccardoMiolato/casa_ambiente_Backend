import { prisma } from "../../../src/lib/prisma";

export async function cleanDatabase() {
    if (process.env.NODE_ENV !== "test") {
        throw new Error(
            "cleanDatabase() can be used only in test environment",
        );
    }

    const databaseUrl = process.env.DATABASE_URL ?? "";

    if (!databaseUrl.includes("casa_ambiente_test")) {
        throw new Error(
            "ERROR: cleanDatabase() is trying to use non test database instance",
        );
    }

    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
}