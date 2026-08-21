import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { setupTestDatabase } from "../utils/helpers/setup";
import { TEST_PASSWORD, TEST_USERNAME } from "../utils/helpers/test-user";

describe("Authentication", () => {
    beforeEach(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test("Login with correct credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
        });

        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.username).toBe(TEST_USERNAME);
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"]?.[0]).toContain("sessionId=");
    });

    test("Authenticated user can access protected route", async () => {
        const agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
            });

        expect(loginResponse.status).toBe(200);

        const response = await agent.get("/api/auth/me");

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(
            TEST_USERNAME,
        );
    });

    test("Unauthenticated user cannot access protected route", async () => {
        const agent = request.agent(app);

        const response = await agent.get("/api/auth/me");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Unauthorized");
    });
});