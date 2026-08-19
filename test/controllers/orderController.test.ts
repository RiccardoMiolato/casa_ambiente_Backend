import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import { createOrder, deleteOrder, getAllOrders, getOrderById, getOrdersByCustomerId, updateOrder } from "../../src/controllers/orderController";
import mockPrismaCustomer from "../utils/mocks/MockPrismaCustomer";
import mockPrismaOrder from "../utils/mocks/MockPrismaOrder";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
    customer: mockPrismaCustomer,
    ordiniMagazzino: mockPrismaOrder,
    $disconnect: mock(async () => {}),
}

mock.module("../../src/lib/prisma", () => ({
    prisma: mockPrisma
}));

describe("Order Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaOrder.findMany.mockClear();
        mockPrismaOrder.findUnique.mockClear();
        mockPrismaOrder.create.mockClear();
        mockPrismaOrder.update.mockClear();
        mockPrismaOrder.delete.mockClear();

        mockRes = new MockResponse();
    });

    describe("getAllOrders", () => {
        it("Should return all orders with code 200", async () => {
            const mockReq = { params: {}, body: {}};

            await getAllOrders(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(3);
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: {}, body: {}};

            mockPrismaOrder.findMany.mockImplementationOnce(() => {
                throw new Error("Internal server error");
            });

            await getAllOrders(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("getOrderById", () => {
        it("Should return specific order with code 200", async () => {
            const mockReq = { params: { id: "1"}, body: {}};

            await getOrderById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toHaveProperty("id", "1");
            expect(mockRes.responseData).toHaveProperty("clienteId", "1");
            expect(mockRes.responseData).toHaveProperty("nome", "Ordine numero 1");
            expect(mockRes.responseData).toHaveProperty("tipologia", "Ingresso");
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = { params: { }, body: {}};

            await getOrderById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id in the request", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {}};

            await getOrderById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1" }, body: {}};

            mockPrismaOrder.findUnique.mockImplementationOnce(() => {
                throw new Error("Internal server error");
            });

            await getOrderById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("getOrdersByCustomerId", () => {
        it("Should return all orders for a specific customer with code 200", async () => {
            const mockReq = { params: { customerId: "1"}, body: {}};

            await getOrdersByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(2);
        });

        it("Should fail with code 400 due to missing customerId in the request", async () => {
            const mockReq = { params: { }, body: {}};

            await getOrdersByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong customerId in the request", async () => {
            const mockReq = { params: { customerId: "fake-id" }, body: {}};

            await getOrdersByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { customerId: "1" }, body: {}};

            mockPrismaOrder.findMany.mockImplementationOnce(() => {
                throw new Error("Internal server error")
            });

            await getOrdersByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("createOrder", () => {
        it("Should create a new order with code 201", async () => {
            const mockReq = {
                params: {},
                body: {
                    clienteId: "1",
                    nome: "New Order",
                    tipologia: "Ingresso"
                }
            };

            await createOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData).toHaveProperty("id");
            expect(mockRes.responseData).toHaveProperty("clienteId", "1");
            expect(mockRes.responseData).toHaveProperty("nome", "New Order");
            expect(mockRes.responseData).toHaveProperty("tipologia", "Ingresso");
        });

        it("Should fail with code 400 due to missing required fields: tipologia", async () => {
            const mockReq = {
                body: {
                    clienteId: "1",
                    nome: "New Order"
                }
            };

            await createOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing required fields: nome", async () => {
            const mockReq = {
                body: {
                    clienteId: "1",
                    tipologia: "Ingresso"
                }
            };

            await createOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong clienteId", async () => {
            const mockReq = {
                params: {},
                body: {
                    clienteId: "fake-id",
                    nome: "New Order",
                    tipologia: "Ingresso"
                }
            };

            await createOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = {
                body: {
                    clienteId: "1",
                    nome: "New Order",
                    tipologia: "Ingresso"
                }
            };

            mockPrismaOrder.create.mockImplementationOnce(() => {
                throw new Error("Internal server error");
            });

            await createOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateOrder", () => {
        it("Should update an existing order with code 200", async () => {
            const mockReq = {
                params: { id: "1" },
                body: {
                    clienteId: "1",
                    nome: "Updated Order",
                    tipologia: "Uscita"
                }
            };

            await updateOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toHaveProperty("id", "1");
            expect(mockRes.responseData).toHaveProperty("clienteId", "1");
            expect(mockRes.responseData).toHaveProperty("nome", "Updated Order");
            expect(mockRes.responseData).toHaveProperty("tipologia", "Uscita");
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = {
                params: {},
                body: {
                    clienteId: "1",
                    nome: "Updated Order",
                    tipologia: "Uscita"
                }
            };

            await updateOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id in the request", async () => {
            const mockReq = {
                params: { id: "fake-id" },
                body: {
                    clienteId: "1",
                    nome: "Updated Order",
                    tipologia: "Uscita"
                }
            };

            mockPrismaOrder.update.mockImplementationOnce(() => {
                throw new Error("Record to update not found.");
            });

            await updateOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong clienteId in the request", async () => {
            const mockReq = {
                params: { id: "1" },
                body: {
                    clienteId: "fake-id",
                    nome: "Updated Order",
                    tipologia: "Uscita"
                }
            };

            mockPrismaOrder.update.mockImplementationOnce(() => {
                throw new Error("Record to update not found.");
            });

            await updateOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = {
                params: { id: "1" },
                body: {
                    clienteId: "1",
                    nome: "Updated Order",
                    tipologia: "Uscita"
                }
            };

            mockPrismaOrder.update.mockImplementationOnce(() => {
                throw new Error("Internal server error");
            });

            await updateOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteOrder", () => {
        it("Should delete an existing order with code 204", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            await deleteOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(204);
            expect(mockPrismaOrder.delete).toHaveBeenCalledWith({
                where: { id: "1" },
            });
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = { params: { }, body: {} };

            mockPrismaOrder.delete.mockImplementationOnce(() => {
                throw new Error("Record to delete not found.");
            });

            await deleteOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id in the request", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {} };

            await deleteOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            mockPrismaOrder.delete.mockImplementationOnce(() => {
                throw new Error("Internal server error");
            });

            await deleteOrder(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});