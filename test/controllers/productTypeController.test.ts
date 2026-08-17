import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import { createProductType, deleteProductType, getAllProductTypes, getProductTypeById, updateProductType } from "../../src/controllers/productController";
import mockPrismaProductType from "../utils/mocks/MockPrismaProductType";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
    tipologiaProdotto: mockPrismaProductType,
    $disconnect: mock(async () => {})
} as any;

mock.module("../../src/lib/prisma", () => ({
  prisma: mockPrisma
}));


describe("Product Type Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaProductType.findMany.mockClear();
        mockPrismaProductType.findUnique.mockClear();
        mockPrismaProductType.create.mockClear();
        mockPrismaProductType.update.mockClear();
        mockPrismaProductType.delete.mockClear();

        mockRes = new MockResponse();
    });

    describe("getAllProductTypes", () => {
        it("Should return all product types with code 200", async () => {
            const mockReq = { params: {}, body: {}};

            await getAllProductTypes(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(4);
        });

        it("Should succed with code 200 calling the function only once", async () => {
            const mockReq = { params: {}, body: {}};

            await getAllProductTypes(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockPrismaProductType.findMany).toHaveBeenCalledTimes(1);
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: {}, body: {}};

            mockPrismaProductType.findMany.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await getAllProductTypes(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("getProductTypeById", () => {
        it("Should succeed with code 200 to retrieve the corresponding product type", async () => {
            const mockReq = { params: { id: "1"}, body: {}};

            await getProductTypeById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.tipoProdotto).toBe("Colla");
        });

        it("Should fail with code 404 due to wrong id", async () => {
            const mockReq = { params: { id: "fake-id"}, body: {}};

            await getProductTypeById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1"}, body: {}};

            mockPrismaProductType.findUnique.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await getProductTypeById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("createProductType", () => {
        it("Should succeed with code 201 to create a new product type", async () => {
            const mockReq = { params: {}, body: { tipoProdotto: "new-product"}};

            await createProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.id).toBe("new-id");
            expect(mockRes.responseData.tipoProdotto).toBe("new-product");
        });

        it("Should fail with code 400 due to missing tipoProdotto in request body", async () => {
            const mockReq = { params: {}, body: {}};

            await createProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: {}, body: { tipoProdotto: "new-type" }};

            mockPrismaProductType.create.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await createProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateProductType", () => {
        it("Should succeed with code 200 to update an existing product type", async () => {
            const mockReq = { params: { id: "1"}, body: { tipoProdotto: "updated-type" }};

            await updateProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.tipoProdotto).toBe("updated-type");
        });

        it("Should fail with code 404 due to wrong product id", async () => {
            const mockReq = { params: { id: "fake-id"}, body: { tipoProdotto: "updated-type" }};

            await updateProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing id params", async () => {
            const mockReq = { params: { }, body: { tipoProdotto: "update-type" }};

            await updateProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing body params", async () => {
            const mockReq = { params: { id: "1"}, body: {  }};

            await updateProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1"}, body: { tipoProdotto: "updated-type" }};

            mockPrismaProductType.update.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await updateProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteProductType", () => {
        it("Should delete successfully with code 204", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            await deleteProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(204);
        });

        it("Should fail with code 400 due to missing id in request params", async () => {
            const mockReq = { params: { }, body: {} };

            await deleteProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id in request params", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {} };

            await deleteProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            mockPrismaProductType.delete.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await deleteProductType(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});