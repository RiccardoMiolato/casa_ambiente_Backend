import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import { createProducer, deleteProducer, getAllProducers, getProducerById, updateProducer } from "../../src/controllers/producerController";
import mockPrismaProducer from "../utils/mocks/MockPrismaProducer";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
    produttore: mockPrismaProducer,
    $disconnect: mock(async () => {})
} as any;

mock.module("../../src/lib/prisma", () => ({
  prisma: mockPrisma
}));

describe("Producer Controller", () => {
    let mockRes: MockResponse;

    beforeEach(() => {
        mockPrismaProducer.findMany.mockClear();
        mockPrismaProducer.findUnique.mockClear();
        mockPrismaProducer.create.mockClear();
        mockPrismaProducer.update.mockClear();
        mockPrismaProducer.delete.mockClear();

        mockRes = new MockResponse();
    });

    describe("getAllProducers", ()  => {
        it("Should return the list of companies with code 200", async () => {
            const mockReq = { params: { }, body: {} };

            await getAllProducers(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData).toBeArrayOfSize(3);
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: { }, body: {} };

            mockPrismaProducer.findMany.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await getAllProducers(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("getProducerById", () => {
        it("Should succed with code 200", async () => {
            const mockReq = { params: { id: "1" }, body: {}};

            await getProducerById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.id).toBe("1");
            expect(mockRes.responseData.nome).toBe("Azienda 1");
            expect(mockRes.responseData.email).toBe("contatti@azienda1.it");
            expect(mockRes.responseData.telefono).toBe("1247584563");
            expect(mockRes.responseData.sitoweb).toBe("www.azienda1.it");
        });

        it("Should fail with code 400 due to missing id params", async () => {
            const mockReq = { params: {}, body: {} };

            await getProducerById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id", async () => {
            const mockReq = { params: { id: "fake-id"}, body: {} };

            await getProducerById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to intenal server error", async () => {
            const mockReq = { params: { id: "2"}, body: {} };

            mockPrismaProducer.findUnique.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await getProducerById(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("createProducer", () => {
        const required_fields = ["nome", "email", "telefono", "sitoweb"];
        const producer_data = {
            nome: "Azienda 4",
            email: "contatti@azienda4.it",
            telefono: "3652414529",
            sitoweb: "www.azienda4.it"
        };

        it("Should create a new producer with code 201", async () => {


            const mockReq = { params: {}, body: { ...producer_data } };

            await createProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(201);
            expect(mockRes.responseData.id).toBe("new-id");
            expect(mockRes.responseData.nome).toBe("Azienda 4");
            expect(mockRes.responseData.email).toBe("contatti@azienda4.it");
            expect(mockRes.responseData.telefono).toBe("3652414529");
            expect(mockRes.responseData.sitoweb).toBe("www.azienda4.it");
        });

        it.each(required_fields)(
            "returns 400 when %s is missing",
            async (field) => {
            const body = { ...producer_data };
            delete body[field as keyof typeof body];

            const mockReq = { params: {}, body };

            await createProducer(mockReq as any, mockRes as any);

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
            }
        );

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: {}, body: {...producer_data}};

            mockPrismaProducer.create.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await createProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("updateProducer", () => {
        it("Should successfully update with code 200", async () => {
            const mockReq = { params: { id: "1" }, body: { nome: "new-name", }};

            await updateProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(200);
            expect(mockRes.responseData.nome).toBe("new-name");
            expect(mockRes.responseData.email).toBe("contatti@azienda1.it");
            expect(mockRes.responseData.telefono).toBe("1247584563");
            expect(mockRes.responseData.sitoweb).toBe("www.azienda1.it");
        });

        it("Should fail with code 400 due to missing id parameter", async () => {
            const mockReq = { params: {  }, body: { nome: "new-name", }};

            await updateProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id", async () => {
            const mockReq = { params: {id: "fake-id"}, body: {nome: "new-name"}};

            await updateProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = { params: {id: "1"}, body: {nome: "new-name"}};

            mockPrismaProducer.update.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await updateProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });

    describe("deleteProducer", () => {
        it("Should delete successfully with code 204", async () => {
            const mockReq = {params: {id: "1"}, body: {}};

            await deleteProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(204);
        });

        it("Should fail with code 400 due to missing id parameter", async () => {
            const mockReq = {params: {}, body: {}};

            await deleteProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(400);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 404 due to wrong id parameter", async () => {
            const mockReq = {params: {id: "fake-id"}, body: {}};

            await deleteProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(404);
            expect(mockRes.responseData).toHaveProperty("error");
        });

        it("Should fail with code 500 due to internal server error", async () => {
            const mockReq = {params: {id: "1"}, body: {}};

            mockPrismaProducer.delete.mockRejectedValueOnce(
                new Error("Internal server error")
            );

            await deleteProducer(
                mockReq as any,
                mockRes as any as Response
            );

            expect(mockRes.statusCode).toBe(500);
            expect(mockRes.responseData).toHaveProperty("error");
        });
    });
});