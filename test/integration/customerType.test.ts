import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { loginAsTestUser } from "../utils/helpers/auth";
import { setupTestDatabase } from "../utils/helpers/setup";

describe("Customer Type Integration", () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("Creation of resources", () => {
        it("Unauthorized request should be denied", async () => {
            const response = await request(app)
                .post("/api/customer/types")
                .send({
                    tipoCliente: "Privato"
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should successfully create the customer type", async () => {
            const agent = await loginAsTestUser();
            const requestBody = {
                tipoCliente: "Privato"
            }

            const response = await agent
                .post("/api/customer/types")
                .send(requestBody);

            expect(response.status).toBe(201);

            const customerType = await prisma.tipologiaCliente.findUnique({
                where: {id: response.body.id}
            });

            expect(customerType?.tipoCliente).toBe("Privato");
        });

        it("Should fail to insert duplicate customer type", async () => {
            const agent = await loginAsTestUser();
            const requestBody = {
                tipoCliente: "Privato"
            }

            const response = await agent
                .post("/api/customer/types")
                .send(requestBody);

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Cannot duplicate customer type value");

            const customerTypesCount = await prisma.tipologiaCliente.count();
            expect(customerTypesCount).toBe(1);
        });
    });

    describe("Listing of resources", () => {
        it("Should not grant access to unauthenticated users", async () => {
            const response = await request(app).get("/api/customer/types");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should retrieve all customer types in the database", async () => {
            const agent = await loginAsTestUser();

            const response = await agent
                .get("/api/customer/types")
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toBeArrayOfSize(1);

            expect(response.body[0].tipoCliente).toBe("Privato");
        });
    });

    describe("Deletion of resources", () => {
        it("Should not grant access to unauthorized users", async () => {
            const response = await request(app).delete("/api/customer/types/id");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should successfully delete customer type", async () => {
            const agent = await loginAsTestUser();

            await prisma.tipologiaCliente.deleteMany();

            const createRes = await agent
                .post("/api/customer/types")
                .send({ tipoCliente: "ToDelete" });
            const idToDelete = createRes.body.id;

            const response = await agent.delete(`/api/customer/types/${idToDelete}`);
            expect(response.status).toBe(200);

            const customerTypesCount = await prisma.tipologiaCliente.count();
            expect(customerTypesCount).toBe(0);
        });

        it("Should fail to delete due to non-existing resource with passed id", async () => {
            const agent = await loginAsTestUser();

            const response = await agent.delete(`/api/customer/types/non-existing-id`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Customer type not found");
        });
    });
});