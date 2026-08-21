import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { loginAsTestUser } from "../utils/helpers/auth";
import { insertCustomer } from "../utils/helpers/database.customer";
import { insertCustomerType } from "../utils/helpers/database.customerType";
import { setupTestDatabase } from "../utils/helpers/setup";

describe("Integration tests for customer", () => {
    let customerTypeId: string;

    beforeAll(async () => {
        await setupTestDatabase();

        const cType = await insertCustomerType("Privato");
        customerTypeId = cType.id;
    });

    afterEach(async () => {
        await prisma.customer.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("GET /api/customers", () => {
        it("Should not grant access if not authorized", async () => {
            const response = await request(app).get("/api/customers");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should return a list of customers", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);
            await insertCustomer("Luca", "Luigini", "lucaluigini@gmail.com", "1236547854", null, "LGNLCA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent.get("/api/customers");

            expect(response.status).toBe(200);
            expect(response.body).toBeArrayOfSize(2);
        });
    });

    describe("GET /api/customers/:id", () => {
        it("Should not grant access if not authorized", async () => {
            const response = await request(app).get("/api/customers/id");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should return a specific customer", async () => {
            const customer = await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent.get(`/api/customers/${customer.id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("name", "Mario");
            expect(response.body).toHaveProperty("surname", "Rossi");
            expect(response.body).toHaveProperty("email", "mariorossi@gmail.com");
            expect(response.body).toHaveProperty("phone", "1447589654");
            expect(response.body).toHaveProperty("pIva", null);
            expect(response.body).toHaveProperty("cFiscale", "RSSMRA23L78L840S");
            expect(response.body).toHaveProperty("comuneResidenza", "Bolzano");
            expect(response.body).toHaveProperty("cap", "23435");
            expect(response.body).toHaveProperty("via", null);
            expect(response.body).toHaveProperty("numeroCivico", null);
            expect(response.body).toHaveProperty("tipoClienteId", customerTypeId);
        });

        it("Should fail to retrieve a customer due to wrong id", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent.get(`/api/customers/fake-id`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Customer not found");
        });
    });

    describe("POST /api/customers", () => {
        it("Should not grant access if not authorized", async () => {
            const response = await request(app).post("/api/customers");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should create a new customer", async () => {
            const agent = await loginAsTestUser();

            const response = await agent
                .post(`/api/customers`)
                .send({
                    name: "Mario",
                    surname: "Rossi",
                    email: "mariorossi@gmail.com",
                    phone: "1447589654",
                    pIva: null,
                    cFiscale: "RSSMRA23L78L840S",
                    comuneResidenza: "Bolzano",
                    cap: "23435",
                    via: null,
                    numeroCivico: null,
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(201);

            const customer = await prisma.customer.findUnique({
                where: {id: response.body.id}
            });

            expect(customer).toHaveProperty("name", "Mario");
            expect(customer).toHaveProperty("surname", "Rossi");
            expect(customer).toHaveProperty("email", "mariorossi@gmail.com");
            expect(customer).toHaveProperty("phone", "1447589654");
            expect(customer).toHaveProperty("pIva", null);
            expect(customer).toHaveProperty("cFiscale", "RSSMRA23L78L840S");
            expect(customer).toHaveProperty("comuneResidenza", "Bolzano");
            expect(customer).toHaveProperty("cap", "23435");
            expect(customer).toHaveProperty("via", null);
            expect(customer).toHaveProperty("numeroCivico", null);
            expect(customer).toHaveProperty("tipoClienteId", customerTypeId);

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(1);
        });

        it("Should fail to create a new customer due to non-existent customer type connection", async () => {
            const agent = await loginAsTestUser();

            const response = await agent
                .post(`/api/customers`)
                .send({
                    name: "Mario",
                    surname: "Rossi",
                    email: "mariorossi@gmail.com",
                    phone: "1447589654",
                    pIva: null,
                    cFiscale: "RSSMRA23L78L840S",
                    comuneResidenza: "Bolzano",
                    cap: "23435",
                    via: null,
                    numeroCivico: null,
                    tipoClienteId: "fake-id",
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Customer type not found")

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(0);
        });

        it("Should fail to insert a new customer due to duplicate email", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .post(`/api/customers`)
                .send({
                    name: "Mario",
                    surname: "Rossi",
                    email: "mariorossi@gmail.com",
                    phone: "1254258647",
                    pIva: null,
                    cFiscale: "RSSMRA23L78L840D",
                    comuneResidenza: "Bolzano",
                    cap: "23435",
                    via: null,
                    numeroCivico: null,
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected creating new customer");

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(1);
        });

        it("Should fail to insert a new customer due to duplicate phone", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .post(`/api/customers`)
                .send({
                    name: "Mario",
                    surname: "Rossi",
                    email: "marioorossi@gmail.com",
                    phone: "1447589654",
                    pIva: null,
                    cFiscale: "RSSMRA23L78L840D",
                    comuneResidenza: "Bolzano",
                    cap: "23435",
                    via: null,
                    numeroCivico: null,
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected creating new customer");

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(1);
        });

        it("Should fail to insert a new customer due to duplicate partita iva", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", "12345", "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .post(`/api/customers`)
                .send({
                    name: "Mario",
                    surname: "Rossi",
                    email: "marioorossi@gmail.com",
                    phone: "1445589654",
                    pIva: "12345",
                    cFiscale: "RSSMRA23L78L840D",
                    comuneResidenza: "Bolzano",
                    cap: "23435",
                    via: null,
                    numeroCivico: null,
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected creating new customer");

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(1);
        });

        it("Should fail to insert a new customer due to duplicate codice fiscale", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .post(`/api/customers`)
                .send({
                    name: "Mario",
                    surname: "Rossi",
                    email: "marioorossi@gmail.com",
                    phone: "3417589654",
                    pIva: null,
                    cFiscale: "RSSMRA23L78L840S",
                    comuneResidenza: "Bolzano",
                    cap: "23435",
                    via: null,
                    numeroCivico: null,
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected creating new customer");

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(1);
        });
    });

    describe("PUT /api/customers/:id", () => {
        it("Should not grant access if not authorized", async () => {
            const response = await request(app).put("/api/customers/id");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should update an existing customer", async () => {
            const customer = await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/${customer.id}`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "luigibianchi@gmail.com",
                    phone: "9876543210",
                    pIva: null,
                    cFiscale: "BNCGLU23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(200);

            const updatedCustomer = await prisma.customer.findUnique({
                where: { id: customer.id },
            });

            expect(updatedCustomer).toHaveProperty("name", "Luigi");
            expect(updatedCustomer).toHaveProperty("surname", "Bianchi");
            expect(updatedCustomer).toHaveProperty("email", "luigibianchi@gmail.com");
            expect(updatedCustomer).toHaveProperty("phone", "9876543210");
            expect(updatedCustomer).toHaveProperty("pIva", null);
            expect(updatedCustomer).toHaveProperty("cFiscale", "BNCGLU23L78L840S");
            expect(updatedCustomer).toHaveProperty("comuneResidenza", "Trento");
            expect(updatedCustomer).toHaveProperty("cap", "12345");
            expect(updatedCustomer).toHaveProperty("via", "Via Roma");
            expect(updatedCustomer).toHaveProperty("numeroCivico", "10");
            expect(updatedCustomer).toHaveProperty("tipoClienteId", customerTypeId);

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(1);
        });

        it("Should fail to update a customer due to non-existent id", async () => {
            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/fake-id`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "luigibianchi@gmail.com",
                    phone: "9876543210",
                    pIva: null,
                    cFiscale: "BNCGLU23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Customer not found");
        });

        it("Should fail to update a customer due to non-existent customer type", async () => {
            const customer = await insertCustomer("Luigi", "Bianchi", "luigibianchi@gmail.com", "9876543210", null, "BNCGLU23L78L840S", "Trento", "12345", null, null, customerTypeId);
            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/${customer.id}`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "luigibianchi@gmail.com",
                    phone: "9876543210",
                    pIva: null,
                    cFiscale: "BNCGLU23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: "fake-id",
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Customer type not found");
        });

        it("Should fail to update a customer due to duplicate email", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);
            const customer = await insertCustomer("Luigi", "Bianchi", "luigibianchi@gmail.com", "9876543210", null, "BNCGLU23L78L840S", "Trento", "12345", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/${customer.id}`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "mariorossi@gmail.com",
                    phone: "9876543210",
                    pIva: null,
                    cFiscale: "BNCGLU23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected updating customer");
        });

        it("Should fail to update a customer due to duplicate phone", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);
            const customer = await insertCustomer("Luigi", "Bianchi", "luigibianchi@gmail.com", "9876543210", null, "BNCGLU23L78L840S", "Trento", "12345", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/${customer.id}`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "luigibianchi@gmail.com",
                    phone: "1447589654",
                    pIva: null,
                    cFiscale: "BNCGLU23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected updating customer");
        });

        it("Should fail to update a customer due to duplicate partita iva", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", "12345", "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);
            const customer = await insertCustomer("Luigi", "Bianchi", "luigibianchi@gmail.com", "9876543210", null, "BNCGLU23L78L840S", "Trento", "12345", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/${customer.id}`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "luigibianchi@gmail.com",
                    phone: "9876543210",
                    pIva: "12345",
                    cFiscale: "BNCGLU23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected updating customer");
        });

        it("Should fail to update a customer due to duplicate codice fiscale", async () => {
            await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);
            const customer = await insertCustomer("Luigi", "Bianchi", "luigibianchi@gmail.com", "9876543210", null, "BNCGLU23L78L840S", "Trento", "12345", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent
                .put(`/api/customers/${customer.id}`)
                .send({
                    name: "Luigi",
                    surname: "Bianchi",
                    email: "luigibianchi@gmail.com",
                    phone: "9876543210",
                    pIva: null,
                    cFiscale: "RSSMRA23L78L840S",
                    comuneResidenza: "Trento",
                    cap: "12345",
                    via: "Via Roma",
                    numeroCivico: "10",
                    tipoClienteId: customerTypeId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "Duplicate value detected updating customer");
        });
    });

    describe("DELETE /api/customers/:id", () => {
        it("Should not grant access if not authorized", async () => {
            const response = await request(app).delete("/api/customers/id");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        });

        it("Should delete an existing customer", async () => {
            const customer = await insertCustomer("Mario", "Rossi", "mariorossi@gmail.com", "1447589654", null, "RSSMRA23L78L840S", "Bolzano", "23435", null, null, customerTypeId);

            const agent = await loginAsTestUser();

            const response = await agent.delete(`/api/customers/${customer.id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Customer deleted successfully");

            const deletedCustomer = await prisma.customer.findUnique({
                where: { id: customer.id },
            });

            expect(deletedCustomer).toBeNull();

            const customerCount = await prisma.customer.count();
            expect(customerCount).toBe(0);
        });

        it("Should fail to delete a customer due to non-existent id", async () => {
            const agent = await loginAsTestUser();

            const response = await agent.delete(`/api/customers/fake-id`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Customer not found");
        });
    });
});