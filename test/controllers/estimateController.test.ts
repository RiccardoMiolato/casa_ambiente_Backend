import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import { addProductToSection, addSectionToEstimate, createEstimate, deleteEstimate, deleteSectionFromEstimate, getAllEstimates, getEstimateById, getEstimatesByCustomerId, getProductsBySectionId, getSectionsByEstimateId, removeProductFromSection, updateEstimate, updateProductQuantityInSection, updateSectionNameInEstimate } from "../../src/controllers/estimateController";
import mockPrismaCustomer from "../utils/mocks/MockPrismaCustomer";
import mockPrismaEstimate from "../utils/mocks/MockPrismaEstimate";
import mockPrismaEstimateSectionProducts from "../utils/mocks/MockPrismaEstimateSectionProducts";
import mockPrismaEstimateSections from "../utils/mocks/MockPrismaEstimateSections";
import mockPrismaProduct, { product1 } from "../utils/mocks/MockPrismaProduct";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
    preventivo: mockPrismaEstimate,
    sezionePreventivo: mockPrismaEstimateSections,
    prodottoSezione: mockPrismaEstimateSectionProducts,
    prodotto: mockPrismaProduct,
    customer: mockPrismaCustomer,
    $disconnect: mock(async () => {})
} as any;

mock.module("../../src/lib/prisma", () => ({
  prisma: mockPrisma
}));

describe("Estimate controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaCustomer.findMany.mockClear();
        mockPrismaCustomer.findUnique.mockClear();
        mockPrismaCustomer.create.mockClear();
        mockPrismaCustomer.update.mockClear();
        mockPrismaCustomer.delete.mockClear();

        mockPrismaEstimate.findMany.mockClear();
        mockPrismaEstimate.findUnique.mockClear();
        mockPrismaEstimate.create.mockClear();
        mockPrismaEstimate.update.mockClear();
        mockPrismaEstimate.delete.mockClear();

        mockRes = new MockResponse();
    });

    describe("getAllEstimates", () => {
        it("Should return all estimates with code 200", async () => {
            const mockReq = { params: {}, body: {} };

            await getAllEstimates(
                mockReq as any,
                mockRes as any as Response
            );

            // Check len of the mocked array
            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArray();
            expect(mockRes.responseData.length).toBe(3);

            // Check data structure
            expect(mockRes.responseData[0].id).toBe("1");
            expect(mockRes.responseData[0].dataScadenza.toString()).toBe(new Date("2026-08-29").toString());
            expect(mockRes.responseData[0].nota).toBe("Preventivo per mattonelle belle");
        });

        it("Should fail due to internal server error", async () => {
            const mockReq = { params: {}, body: {} };

            mockPrismaEstimate.findMany.mockRejectedValueOnce(
                new Error("Error during database operations")
            );

            await getAllEstimates(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        })
    });

    describe("getEstimateById", () => {
        it("Should succeed with code 200", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            await getEstimateById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.dataScadenza.toString()).toBe(new Date("2026-08-29").toString());
            expect(mockRes.responseData.nota).toBe("Preventivo per mattonelle belle");
        });

        it("Should fail with code 400 due to missing params", async () => {
            const mockReq = { params: { }, body: {} };

            await getEstimateById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {} };

            await getEstimateById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to database server error", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            mockPrisma.preventivo.findUnique.mockRejectedValueOnce(
                new Error("Error during database operations")
            );

            await getEstimateById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("getEstimatesByCustomerId", () => {
        it("Should succeed with code 200", async () => {
            const mockReq = { params: { customerId: "1" }, body: {} };

            await getEstimatesByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArray();
            expect(mockRes.responseData.length).toBe(2);

            // Check data structure
            expect(mockRes.responseData[0].id).toBe("1");
            expect(mockRes.responseData[0].customerId).toBe("1");
            expect(mockRes.responseData[0].dataScadenza.toString()).toBe(new Date("2026-08-29").toString());
            expect(mockRes.responseData[0].nota).toBe("Preventivo per mattonelle belle");
        });

        it("Should fail with code 400 due to missing params", async () => {
            const mockReq = { params: { }, body: {} };

            await getEstimatesByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong customer id", async () => {
            const mockReq = { params: { customerId: "fake-customer-id" }, body: {} };

            await getEstimatesByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
            expect(mockRes.responseData.error).toBe("No customer found with id fake-customer-id");
        });

        it("Should fail with code 404 due to customer not having estimates", async () => {
            const mockReq = { params: { customerId: "3" }, body: {} };

            await getEstimatesByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
            expect(mockRes.responseData.error).toBe("No estimates found for this customer");
        });

        it("Should fail with code 500 due to database server error", async () => {
            const mockReq = { params: { customerId: "1" }, body: {} };

            mockPrisma.preventivo.findMany.mockRejectedValueOnce(
                new Error("Error during database operations")
            );

            await getEstimatesByCustomerId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("createEstimate", () => {
        it("Should create a new estimate with code 201", async () => {
            const mockReq = {
                params: {},
                body: {
                    customerId: "1",
                    dataScadenza: "2026-08-29",
                    nota: "Preventivo magnifico"
            }};

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.id).toBe("new-id");
            expect(mockRes.responseData.customerId).toBe("1");
            expect(mockRes.responseData.dataScadenza.toString()).toBe(new Date("2026-08-29").toString());
            expect(mockRes.responseData.nota).toBe("Preventivo magnifico");
        });

        it("Should create a new estimate with code 201 without nota", async () => {
            const mockReq = {
                params: {},
                body: {
                    customerId: "1",
                    dataScadenza: "2026-08-29",
            }};

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.id).toBe("new-id");
            expect(mockRes.responseData.customerId).toBe("1");
            expect(mockRes.responseData.dataScadenza.toString()).toBe(new Date("2026-08-29").toString());
        });

        it("Should fail to create new estimate with code 400 due to missing customerId", async () => {
            const mockReq = {
                params: {},
                body: {
                    dataScadenza: "2026-08-29",
            }};

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail to create new estimate with code 400 due to missing dataScadenza", async () => {
            const mockReq = {
                params: {},
                body: {
                    customerId: "1",
            }};

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail to create new estimate with code 400 due to wrong dataScadenza", async () => {
            const mockReq = {
                params: {},
                body: {
                    customerId: "3",
                    dataScadenza: "Domani",
            }};

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail to create new estimate with code 404 due to wrong customerId", async () => {
            const mockReq = {
                params: {},
                body: {
                    customerId: "fake-customer-id",
                    dataScadenza: "2026-08-29",
            }};

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server errors", async () => {
            const mockReq = {
                params: {},
                body: {
                    customerId: "1",
                    dataScadenza: "2026-08-29",
            }};

            mockPrismaEstimate.create.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await createEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateEstimate", () => {
        it("Should update an estimate with code 200", async () => {
            const mockReq = {
                params: {id: "1"},
                body: {
                    dataScadenza: "2026-08-31",
                    nota: "Preventivo bello"
            }};

            await updateEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.customerId).toBe("1");
            expect(mockRes.responseData.dataScadenza.toString()).toBe(new Date("2026-08-31").toString());
            expect(mockRes.responseData.nota).toBe("Preventivo bello");
        });

        it("Should fail to update new estimate with code 400 due to missing estimate id", async () => {
            const mockReq = {
                params: {},
                body: {
                    dataScadenza: "2026-08-29",
            }};

            await updateEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail to update new estimate with code 400 due to wrong dataScadenza", async () => {
            const mockReq = {
                params: {id: "1"},
                body: {
                    dataScadenza: "Domani",
            }};

            await updateEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });


        it("Should fail with code 500 due to internal server errors", async () => {
            const mockReq = {
                params: {id: "2"},
                body: {
                    dataScadenza: "2026-08-29",
                    nota: "nota"
            }};

            mockPrismaEstimate.update.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await updateEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteEstimate", () => {
        it("Should delete an estimate with code 204", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            await deleteEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(204);
        });

        it("Should fail with code 400 due to missing estimate id", async () => {
            const mockReq = { params: {}, body: {} };

            await deleteEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existent estimate id", async () => {
            const mockReq = { params: { id: "fake-id" }, body: {} };

            await deleteEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { id: "1" }, body: {} };

            mockPrismaEstimate.delete.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await deleteEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});

describe("Estimate Sections Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaCustomer.findMany.mockClear();
        mockPrismaCustomer.findUnique.mockClear();
        mockPrismaCustomer.create.mockClear();
        mockPrismaCustomer.update.mockClear();
        mockPrismaCustomer.delete.mockClear();

        mockPrismaEstimate.findMany.mockClear();
        mockPrismaEstimate.findUnique.mockClear();
        mockPrismaEstimate.create.mockClear();
        mockPrismaEstimate.update.mockClear();
        mockPrismaEstimate.delete.mockClear();

        mockPrismaEstimateSections.findMany.mockClear();
        mockPrismaEstimateSections.findUnique.mockClear();
        mockPrismaEstimateSections.create.mockClear();
        mockPrismaEstimateSections.update.mockClear();
        mockPrismaEstimateSections.delete.mockClear();

        mockRes = new MockResponse();
    })

    describe("getSectionsByEstimateId", () => {
        it("Should return a list of sections with code 200", async () => {
            const mockReq = { params: { estimateId: "1"}, body: {} };

            await getSectionsByEstimateId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArray();
            expect(mockRes.responseData.length).toBe(2);
        });

        it("Should fail with code 400 due to missing parameter", async () => {
            const mockReq = { params: { }, body: {} };

            await getSectionsByEstimateId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id", async () => {
            const mockReq = { params: { estimateId: "fake-id" }, body: {} };

            await getSectionsByEstimateId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { estimateId: "1" }, body: {} };

            mockPrismaEstimateSections.findMany.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await getSectionsByEstimateId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("addSectionToEstimate", () => {
        it("Should succeed with code 201", async () => {
            const mockReq = { params: { estimateId: "1" }, body: {nome: "new-section"} };

            await addSectionToEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);

            expect(mockRes.responseData.id).toBe("new-id");
            expect(mockRes.responseData.nome).toBe("new-section");
            expect(mockRes.responseData.preventivoId).toBe("1");
        });

        it("Should fail with code 400 due to missing estimateId", async () => {
            const mockReq = { params: {  }, body: {nome: "new-section"} };

            await addSectionToEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });


        it("Should fail with code 400 due to missing section name", async () => {
            const mockReq = { params: { estimateId: "1" }, body: { } };

            await addSectionToEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to missing wrong estimateId", async () => {
            const mockReq = { params: { estimateId: "fake-id" }, body: {nome: "new-section"} };

            await addSectionToEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { estimateId: "1" }, body: {nome: "new-section"} };

            mockPrismaEstimateSections.create.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await addSectionToEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateSectionNameInEstimate", () => {
        it("Should succeed with code 200", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "1" }, body: { nome: "new-section-name" } };

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);

            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.nome).toBe("new-section-name");
        });

        it("Should fail with code 400 due to missing param: estimateId", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { nome: "new-section-name" } };

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing param: sectionId", async () => {
            const mockReq = { params: { estimateId: "1" }, body: { nome: "new-section-name" } };

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing body: nome", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "1" }, body: { } };

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong estimateId", async () => {
            const mockReq = { params: { estimateId: "fake-id", sectionId: "1" }, body: { nome: "new-section-name" } };

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong sectionId", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "fake-id" }, body: { nome: "new-section-name" } };

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due internal server error", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "1" }, body: { nome: "new-section-name" } };

            mockPrismaEstimateSections.update.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await updateSectionNameInEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteSectionFromEstimate", () => {
        it("Should successfully delete a section from an estimate with code 204", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "1"}, body: {} };

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(204);
        });

        it("Should fail with code 400 due to missing param: estimateId", async () => {
            const mockReq = { params: { sectionId: "1"}, body: {} };

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing param: sectionId", async () => {
            const mockReq = { params: { estimateId: "1" }, body: {} };

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong estimateId", async () => {
            const mockReq = { params: { estimateId: "fake-id", sectionId: "1"}, body: {} };

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong sectionId", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "fake-id"}, body: {} };

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 409 due to wrong sectionId for a specific estimate", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "4"}, body: {} };

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(409);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "1"}, body: {} };

            mockPrismaEstimateSections.delete.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await deleteSectionFromEstimate(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});


describe("Section-Products Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaCustomer.findMany.mockClear();
        mockPrismaCustomer.findUnique.mockClear();
        mockPrismaCustomer.create.mockClear();
        mockPrismaCustomer.update.mockClear();
        mockPrismaCustomer.delete.mockClear();

        mockPrismaEstimate.findMany.mockClear();
        mockPrismaEstimate.findUnique.mockClear();
        mockPrismaEstimate.create.mockClear();
        mockPrismaEstimate.update.mockClear();
        mockPrismaEstimate.delete.mockClear();

        mockPrismaEstimateSections.findMany.mockClear();
        mockPrismaEstimateSections.findUnique.mockClear();
        mockPrismaEstimateSections.create.mockClear();
        mockPrismaEstimateSections.update.mockClear();
        mockPrismaEstimateSections.delete.mockClear();

        mockPrismaEstimateSectionProducts.create.mockClear();
        mockPrismaEstimateSectionProducts.update.mockClear();
        mockPrismaEstimateSectionProducts.delete.mockClear();

        mockRes = new MockResponse();
    })

    describe("getProductsBySectionId", () => {
        it("Should succeed with code 200 returning products relative to a single section", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "1"}, body: {}};

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(2);
            expect(mockRes.responseData[0]).toHaveProperty("id");
            expect(mockRes.responseData[0]).toHaveProperty("codiceProdotto");
            expect(mockRes.responseData[0]).toHaveProperty("codiceColore");
            expect(mockRes.responseData[0]).toHaveProperty("descrizione");
            expect(mockRes.responseData[0]).toHaveProperty("tipoProdottoId");
            expect(mockRes.responseData[0]).toHaveProperty("produttoreId");
            expect(mockRes.responseData[0]).toHaveProperty("dimensione");
            expect(mockRes.responseData[0]).toHaveProperty("dimensione");
            expect(mockRes.responseData[0]).toHaveProperty("prezzo");
        });

        it("Should fail with code 400 due to missing estimate id", async () => {
            const mockReq = { params: { sectionId: "1" }, body: {}};

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing section id", async () => {
            const mockReq = { params: { estimateId: "1" }, body: {}};

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing estimate", async () => {
            const mockReq = { params: { estimateId: "fake-id", sectionId: "1"}, body: {}};

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to non-existing section", async () => {
            const mockReq = { params: { estimateId: "1", sectionId: "fake-id"}, body: {}};

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 409 due to wrong id for estimate given estimate section", async () => {
            const mockReq = { params: { estimateId: "2", sectionId: "1"}, body: {}};

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(409);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { estimateId: "2", sectionId: "1"}, body: {}};

            mockPrismaEstimateSections.findUnique.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await getProductsBySectionId(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("addProductToSection", () => {
        it("Should succeed with code 201 adding a product to a section", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { productId: "1", quantity: 5}};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.quantità).toBe(5);
            expect(mockRes.responseData.prezzo).toBe(product1.prezzo);
            expect(mockRes.responseData.sezione.connect.id).toBe("1");
            expect(mockRes.responseData.prodotto.connect.id).toBe("1");
        });

        it("Should fail with code 400 due to missing section id", async () => {
            const mockReq = { params: {  }, body: { productId: "1", quantity: 5}};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing product id", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { quantity: 5}};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing quantity", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { productId: "1" }};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong section id", async () => {
            const mockReq = { params: { sectionId: "fake-id" }, body: { productId: "1", quantity: 5}};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong section id", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { productId: "fake-id", quantity: 5}};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to negative quantity", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { productId: "1", quantity: -1}};

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { productId: "1", quantity: 5}};

            mockPrismaEstimateSectionProducts.create.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await addProductToSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateProductQuantityInSection", async () => {
        it("Should update quantity correctly with code 200", async () => {
            const mockReq = { params: { sectionId: "1", productId: "1" }, body: { quantity: 10 } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.quantità).toBe(10);
        });

        it("Should fail with code 400 due to missing section id", async () => {
            const mockReq = { params: { productId: "1" }, body: { quantity: 10 } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing product id", async () => {
            const mockReq = { params: { sectionId: "1" }, body: { quantity: 10 } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing quantity", async () => {
            const mockReq = { params: { sectionId: "1", productId: "1" }, body: { } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to negative quantity", async () => {
            const mockReq = { params: { sectionId: "1", productId: "1" }, body: { quantity: -1 } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong section id", async () => {
            const mockReq = { params: { sectionId: "fake-id", productId: "1" }, body: { quantity: 10 } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong product id", async () => {
            const mockReq = { params: { sectionId: "1", productId: "fake-id" }, body: { quantity: 10 } };

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { sectionId: "1", productId: "1" }, body: { quantity: 10 } };

            mockPrismaEstimateSectionProducts.update.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await updateProductQuantityInSection(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("removeProductFromSection", () => {
        it("Should succeed with code 204 removing a product from a section", async () => {
            const mockReq = { params: { sectionId: "1", productId: "1"}, body: {}};

            await removeProductFromSection(
                mockReq as any,
                mockRes as any as Response
            );


            expect(mockRes.statusCode).toBe(204);
        });

        it("Should fail with code 400 due to missing parameter: sectionId", async () => {
            const mockReq = { params: { productId: "1"}, body: {}};

            await removeProductFromSection(
                mockReq as any,
                mockRes as any as Response
            );


            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 400 due to missing parameter: productId", async () => {
            const mockReq = { params: { sectionId: "1" }, body: {}};

            await removeProductFromSection(
                mockReq as any,
                mockRes as any as Response
            );


            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong parameter: sectionId", async () => {
            const mockReq = { params: { sectionId: "fake-id", productId: "1" }, body: {}};

            await removeProductFromSection(
                mockReq as any,
                mockRes as any as Response
            );


            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong parameter: productId", async () => {
            const mockReq = { params: { sectionId: "1", productId: "fake-id" }, body: {}};

            await removeProductFromSection(
                mockReq as any,
                mockRes as any as Response
            );


            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { sectionId: "1", productId: "1" }, body: {}};

            mockPrismaEstimateSectionProducts.delete.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await removeProductFromSection(
                mockReq as any,
                mockRes as any as Response
            );


            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});