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

    describe("Login", () => {
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

        test("Login with missing username", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    password: TEST_PASSWORD,
            });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Username and password are required");
        });

        test("Login with missing password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    username: TEST_USERNAME
            });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Username and password are required");
        });

        test("Login with incorrect username", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    username: "fake-username",
                    password: TEST_PASSWORD,
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Invalid credentials");
        });

        test("Login with incorrect password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    username: TEST_USERNAME,
                    password: "wrong-password",
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Invalid credentials");
        });
    });

    describe("Authentication tests", () => {
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
            const sessions = await prisma.session.findMany({
                where: {
                    user: {
                        username: TEST_USERNAME,
                    },
                },
            });
            expect(sessions).toHaveLength(1);
        });

        test("Unauthenticated user cannot access protected route", async () => {
            const response = await request(app).get("/api/auth/me");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });
    });

    describe("Logout procedure", () => {
        test("Logout invalidates the session and denies further access", async () => {
            const agent = request.agent(app);

            const loginResponse = await agent
                .post("/api/auth/login")
                .send({
                    username: TEST_USERNAME,
                    password: TEST_PASSWORD,
                });

            expect(loginResponse.status).toBe(200);

            const meResponseAuth = await agent.get("/api/auth/me");
            expect(meResponseAuth.status).toBe(200);

            // Logout part
            const logoutResponse = await agent.post("/api/auth/logout");
            expect(logoutResponse.status).toBe(204);

            const meResponseUnauth = await agent.get("/api/auth/me");
            expect(meResponseUnauth.status).toBe(401);

            const sessions = await prisma.session.findMany({
                where: {
                    user: {
                        username: TEST_USERNAME,
                    },
                },
            });

            expect(sessions).toHaveLength(0);
        });
    });
});