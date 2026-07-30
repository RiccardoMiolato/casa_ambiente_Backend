import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import { createCustomerType, deleteCustomerType, getAllCustomerTypes } from "../../src/controllers/customerTypeController";
import mockPrismaCustomerType from "../utils/mocks/MockPrismaCustomerType";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
    tipologiaCliente: mockPrismaCustomerType,
    $disconnect: mock(async () => {})
} as any;

mock.module("../../src/lib/prisma", () => ({
  prisma: mockPrisma
}));

describe("Customer Type Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaCustomerType.findMany.mockClear();
        mockPrismaCustomerType.findUnique.mockClear();
        mockPrismaCustomerType.create.mockClear();
        mockPrismaCustomerType.delete.mockClear();

        mockRes = new MockResponse();
    });

    describe("getAllCustomerTypes", () => {
        it("Should return all customer types with code 200", async () => {
            const mockReq = { params: {}, body: {} };

            await getAllCustomerTypes(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);

            expect(mockRes.responseData).toBeArray();
            expect(mockRes.responseData).toBeArrayOfSize(2);

            expect(mockRes.responseData[0].tipoCliente).toBe("privato");
            expect(mockRes.responseData[1].tipoCliente).toBe("rivenditore");
        });

        it("Should succeed with code 200 calling db only once", async () => {
            const mockReq = { params: {}, body: {} };

            await getAllCustomerTypes(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockPrismaCustomerType.findMany).toHaveBeenCalledTimes(1);
        });

        it("Should fail with code 500 due to server errors", async () => {
            const mockReq = { params: {}, body: {} } as any;

            mockPrismaCustomerType.findMany.mockRejectedValueOnce(
                new Error("Error during database operations")
            );

            await getAllCustomerTypes(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("createCustomerType", async () => {
        it("Should create a new customer type with code 201", async () => {
            const mockReq = { params: {}, body: {tipoCliente: "privato"} } as any;

            await createCustomerType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.tipoCliente).toBe("privato");
        });

        it("Should fail to create a customer due to missing parameters with code 400", async () => {
            const mockReq = { params: {}, body: {} }

            await createCustomerType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail due to internal server error with code 500", async () => {
            const mockReq = { params: {}, body: { tipoCliente: "privato" }};

            mockPrismaCustomerType.create.mockRejectedValueOnce(
                new Error("Error during database operations")
            );

            await createCustomerType(
                mockReq as any,
                mockRes as any as Response,
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteCustomerType", () => {
        it("Should delete customer with code 200", async () => {
            const mockReq = { params: { id: "1" }, body: {} } as any;

            await deleteCustomerType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.tipoCliente).toBe("privato");
        });

        it("Should fail due to missing parameter with code 400", async () => {
            const mockReq = { params: {  }, body: {} } as any;

            await deleteCustomerType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail due to wrong id with code 404", async () => {
            const mockReq = { params: { id: "not-correct-id" }, body: {} } as any;

            await deleteCustomerType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail due to database malfunctions with code 500", async () => {
            const mockReq = { params: { id: "1" }, body: {} } as any;

            mockPrismaCustomerType.delete.mockRejectedValueOnce(
                new Error("Error handling internal database operations")
            );

            await deleteCustomerType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});

