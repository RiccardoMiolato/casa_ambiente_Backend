import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, getProductsByProducerId, updateProduct } from "../../src/controllers/productController";
import mockPrismaProducer from "../utils/mocks/MockPrismaProducer";
import mockPrismaProduct from "../utils/mocks/MockPrismaProduct";
import mockPrismaProductType from "../utils/mocks/MockPrismaProductType";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
    prodotto: mockPrismaProduct,
    tipologiaProdotto: mockPrismaProductType,
    produttore: mockPrismaProducer,
    $disconnect: mock(async () => {})
} as any;

mock.module("../../src/lib/prisma", () => ({
  prisma: mockPrisma
}));

describe("Product Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaProduct.findMany.mockClear();
        mockPrismaProduct.findUnique.mockClear();
        mockPrismaProduct.create.mockClear();
        mockPrismaProduct.update.mockClear();
        mockPrismaProduct.delete.mockClear();

        mockPrismaProducer.findMany.mockClear();
        mockPrismaProducer.findUnique.mockClear();
        mockPrismaProducer.create.mockClear();
        mockPrismaProducer.update.mockClear();
        mockPrismaProducer.delete.mockClear();

        mockPrismaProductType.findMany.mockClear();
        mockPrismaProductType.findUnique.mockClear();
        mockPrismaProductType.create.mockClear();
        mockPrismaProductType.update.mockClear();
        mockPrismaProductType.delete.mockClear();

        mockRes = new MockResponse();
    });

    describe("getAllProducts", () => {
        it("Should return all products with code 200", async () => {
            const mockReq = { params: {}, body: {}};

            await getAllProducts(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(3);
        });

        it("Should return all products with code 500", async () => {
            const mockReq = { params: {}, body: {}};

            mockPrismaProduct.findMany.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await getAllProducts(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("getProductById", () => {
        it("Should succeed with code 200 to retrieve the corresponding product", async () => {
            const mockReq = { params: { id: "1"}, body: {}};

            await getProductById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.codiceProdotto).toBe("P001");
            expect(mockRes.responseData.codiceColore).toBe("C001");
            expect(mockRes.responseData.descrizione).toBe("Colla forte");
            expect(mockRes.responseData.tipoProdottoId).toBe("1");
            expect(mockRes.responseData.produttoreId).toBe("1");
            expect(mockRes.responseData.dimensione).toBe("500ml");
            expect(mockRes.responseData.unitàPerScatola).toBe(12);
            expect(mockRes.responseData.prezzo).toBe(9.99);
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = { params: { }, body: {}};

            await getProductById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error")
        });

        it("Should fail with code 404 due to wrong id in the request", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {}};

            await getProductById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error")
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {}};

            mockPrismaProduct.findUnique.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await getProductById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error")
        });
    });

    describe("getProductsByProducerId", () => {
        it("Should succeed with code 200 to retrieve all products for producer 1", async () => {
            const mockReq = { params: { id: "1"}, body: {}};

            await getProductsByProducerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(2);
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = { params: { }, body: {}};

            await getProductsByProducerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error")
        });

        it("Should fail with code 404 due to wrong id in the request", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {}};

            await getProductsByProducerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error")
        });

        it("Should fail with code 500 due to wrong id in the request", async () => {
            const mockReq = { params: { id: "1" }, body: {}};

            mockPrismaProduct.findMany.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await getProductsByProducerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error")
        });
    });

    describe("createProduct", () => {
        const product_data = {
            codiceProdotto: "P004",
            codiceColore: "C004",
            descrizione: "New Product",
            tipoProdottoId: "1",
            produttoreId: "1",
            dimensione: "100ml",
            unitàPerScatola: 10,
            prezzo: 19.99
        }

        const required_fields = ["codiceProdotto", "codiceColore", "descrizione", "tipoProdottoId", "produttoreId", "dimensione", "unitàPerScatola", "prezzo"];

        it("Should succeed with code 201 to create a new product", async () => {
            const mockReq = { params: {}, body: {
                ...product_data
            }};

            await createProduct(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.id).toBe("new-id");
            expect(mockRes.responseData.codiceProdotto).toBe("P004");
            expect(mockRes.responseData.codiceColore).toBe("C004");
            expect(mockRes.responseData.descrizione).toBe("New Product");
            expect(mockRes.responseData.tipoProdotto.connect.id).toBe("1");
            expect(mockRes.responseData.produttore.connect.id).toBe("1");
            expect(mockRes.responseData.dimensione).toBe("100ml");
            expect(mockRes.responseData.unitàPerScatola).toBe(10);
            expect(mockRes.responseData.prezzo).toBe(19.99);
        });

        it.each(required_fields)(
            "Should fail with code 400 due to %s missing",
            async (field) => {
            const body = { ...product_data };
            delete body[field as keyof typeof body];

            const mockReq = { params: {}, body };

            await createProduct(mockReq as any, mockRes as any);

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
            }
        );

        it("Should fail with code 404 due to non-existing producer", async () => {
            const mockReq = { params: {}, body: {
                ...product_data,
                produttoreId: "fake-id"
            }};

            await createProduct(mockReq as any, mockRes as any);

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing product type", async () => {
            const mockReq = { params: {}, body: {
                ...product_data,
                tipoProdottoId: "fake-id"
            }};

            await createProduct(mockReq as any, mockRes as any);

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: {}, body: {
                ...product_data
            }};

            mockPrismaProduct.create.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await createProduct(mockReq as any, mockRes as any);

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateProduct", () => {
        const updated_product_data = {
            codiceProdotto: "P004",
            codiceColore: "C005",
            descrizione: "Updated Product",
            tipoProdottoId: "2",
            produttoreId: "2",
            dimensione: "200ml",
            unitàPerScatola: 20,
            prezzo: 29.99
        };

        it("Should succeed with code 200 to update an existing product", async () => {
            const mockReq = { params: { id: "1" }, body: { ...updated_product_data } };

            await updateProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.codiceProdotto).toBe("P004");
            expect(mockRes.responseData.codiceColore).toBe("C005");
            expect(mockRes.responseData.descrizione).toBe("Updated Product");
            expect(mockRes.responseData.tipoProdottoId).toBe("2");
            expect(mockRes.responseData.produttoreId).toBe("2");
            expect(mockRes.responseData.dimensione).toBe("200ml");
            expect(mockRes.responseData.unitàPerScatola).toBe(20);
            expect(mockRes.responseData.prezzo).toBe(29.99);
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = { params: {}, body: { ...updated_product_data } };

            await updateProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing product id", async () => {
            const mockReq = { params: { id: "fake-id" }, body: { ...updated_product_data } };

            await updateProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing producer id", async () => {
            const mockReq = { params: { id: "1" }, body: {
                ...updated_product_data,
                produttoreId: "fake-id"
            } };

            await updateProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing product type id", async () => {
            const mockReq = { params: { id: "1" }, body: {
                ...updated_product_data,
                tipoProdottoId: "fake-id"
            } };

            await updateProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1" }, body: { ...updated_product_data } };

            mockPrismaProduct.update.mockRejectedValueOnce(new Error("Internal Server Error"));

            await updateProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteProduct", () => {
        it("Should succeed with code 200 to delete an existing product", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            await deleteProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toHaveProperty("message");
        });

        it("Should fail with code 400 due to missing id in the request", async () => {
            const mockReq = { params: {}, body: {} };

            await deleteProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing product id", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {} };

            await deleteProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            mockPrismaProduct.delete.mockRejectedValueOnce(new Error("Internal Server Error"));

            await deleteProduct(mockReq as any, mockRes as any as Response);

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});
