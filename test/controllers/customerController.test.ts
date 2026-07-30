import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Response } from "express";
import mockPrismaCustomer from "../utils/mocks/MockPrismaCustomer";
import MockResponse from "../utils/mocks/MockResponse";

const mockPrisma = {
  customer: mockPrismaCustomer,
  $disconnect: mock(async () => {}),
} as any;

mock.module("../../src/lib/prisma", () => ({
  prisma: mockPrisma
}));

import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer
} from "../../src/controllers/customerController";

describe("Customer Controller", () => {
  let mockRes: MockResponse;

  beforeEach(() => {
    mockPrismaCustomer.findMany.mockClear();
    mockPrismaCustomer.findUnique.mockClear();
    mockPrismaCustomer.create.mockClear();
    mockPrismaCustomer.update.mockClear();
    mockPrismaCustomer.delete.mockClear();

    mockRes = new MockResponse();
  });

  describe("getAllCustomers", () => {
    it("Should return all customers with 200 status", async () => {
      const mockReq = { params: {}, body: {} } as any;

      await getAllCustomers(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(200);
      expect(Array.isArray(mockRes.responseData)).toBe(true);
      expect(mockRes.responseData.length).toBe(1);
    });

    it("Should call findMany once", async () => {
      const mockReq = { params: {}, body: {} } as any;

      await getAllCustomers(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockPrismaCustomer.findMany).toHaveBeenCalledTimes(1);
    });

    it("Should fail with code 500 due to database error", async () => {
      const mockReq = { params: {}, body: {} } as any;

      mockPrismaCustomer.findMany.mockRejectedValueOnce(
        new Error("Error in the database, impossible to continue")
      );

      await getAllCustomers(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData).toHaveProperty("error");
    });
  });

  describe("getCustomerById", () => {
    it("Should return the correct customer with 200 as status code", async () => {
      const mockReq = { params: {id: "1"}, body: {} } as any;

      await getCustomerById(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(200);
      expect(Array.isArray(mockRes.responseData)).toBe(false);
      expect(mockRes.responseData.name).toBe("John")
    });

    it("Should return 404 due to wrong id number", async () => {
      const mockReq = { params: {id: "2"}, body: {} } as any;

      await getCustomerById(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.responseData).toHaveProperty("error");
    });

    it("Should return 400 due to missing parameters", async () => {
      const mockReq = { params: {}, body: {} } as any;

      await getCustomerById(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData).toHaveProperty("error");
    });

    it("Should fail with code 500 due to database error", async () => {
      const mockReq = { params: {id: "1"}, body: {} } as any;

      mockPrismaCustomer.findUnique.mockRejectedValueOnce(
        new Error("Error in the database, impossible to continue")
      );

      await getCustomerById(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData).toHaveProperty("error");
    });
  });

  describe("createCustomer", () => {
    const customer_data = {
      name: "Luca",
      surname: "Albertini",
      email: "luca.albertini@mail.com",
      phone: "4152635124",
      cFiscale: "LBTLCU75D16O985M",
      comuneResidenza: "Camisano Vicentino",
      cap: "36043",
      via: "Largo Rossi",
      numeroCivico: "82",
      tipoClienteId: "privato"
    }

    const requiredFields = ["name", "surname", "email", "phone", "comuneResidenza", "cap", "tipoClienteId"]

    it("Should create a customer with 201 response code - with codice Fiscale", async () => {
      const mockReq = { params: {}, body: customer_data } as any

      await createCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.name).toBe("Luca");
      expect(mockRes.responseData.surname).toBe("Albertini");
      expect(mockRes.responseData.email).toBe("luca.albertini@mail.com");
      expect(mockRes.responseData.phone).toBe("4152635124");
      expect(mockRes.responseData.cFiscale).toBe("LBTLCU75D16O985M");
      expect(mockRes.responseData.comuneResidenza).toBe("Camisano Vicentino");
      expect(mockRes.responseData.cap).toBe("36043");
      expect(mockRes.responseData.via).toBe("Largo Rossi");
      expect(mockRes.responseData.numeroCivico).toBe("82");
      expect(mockRes.responseData.tipoClienteId).toBe("privato");
    });

    it("Should create a customer with 201 response code - with partita iva", async () => {
      const _body = { ...customer_data }
      delete _body["cFiscale" as keyof typeof _body];
      const body = {
        ..._body,
        "pIva": "2928343567"
      };

      const mockReq = { params: {}, body } as any

      await createCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.name).toBe("Luca");
      expect(mockRes.responseData.surname).toBe("Albertini");
      expect(mockRes.responseData.email).toBe("luca.albertini@mail.com");
      expect(mockRes.responseData.phone).toBe("4152635124");
      expect(mockRes.responseData.pIva).toBe("2928343567");
      expect(mockRes.responseData.comuneResidenza).toBe("Camisano Vicentino");
      expect(mockRes.responseData.cap).toBe("36043");
      expect(mockRes.responseData.via).toBe("Largo Rossi");
      expect(mockRes.responseData.numeroCivico).toBe("82");
      expect(mockRes.responseData.tipoClienteId).toBe("privato")
    });

    it("Should create a customer with 201 response code with minimum informations", async () => {
      const body = { ...customer_data };
      delete body["via" as keyof typeof body];
      delete body["numeroCivico" as keyof typeof body];

      const mockReq = { params: {}, body: customer_data } as any

      await createCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.name).toBe("Luca");
      expect(mockRes.responseData.surname).toBe("Albertini");
      expect(mockRes.responseData.email).toBe("luca.albertini@mail.com");
      expect(mockRes.responseData.phone).toBe("4152635124");
      expect(mockRes.responseData.cFiscale).toBe("LBTLCU75D16O985M");
      expect(mockRes.responseData.comuneResidenza).toBe("Camisano Vicentino");
      expect(mockRes.responseData.cap).toBe("36043");
      expect(mockRes.responseData.tipoClienteId).toBe("privato")
    });

    it.each(requiredFields)(
      "returns 400 when %s is missing",
      async (field) => {
        const body = { ...customer_data };
        delete body[field as keyof typeof body];

        const mockReq = { params: {}, body };

        await createCustomer(mockReq as any, mockRes as any);

        expect(mockRes.statusCode).toBe(400);
        expect(mockRes.responseData).toHaveProperty("error");
      }
    );

    it("returns 400 when both partita iva and codice fiscale are missing", async () => {
        const body = { ...customer_data };
        delete body["cFiscale" as keyof typeof body];

        const mockReq = { params: {}, body };

        await createCustomer(mockReq as any, mockRes as any);

        expect(mockRes.statusCode).toBe(400);
        expect(mockRes.responseData).toHaveProperty("error");
      }
    );

    it("Should fail with code 500 due to database error", async () => {
      const mockReq = { params: {}, body: {...customer_data} } as any;

      mockPrismaCustomer.create.mockRejectedValueOnce(
        new Error("Error in the database, impossible to continue")
      );

      await createCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData).toHaveProperty("error");
    });
  });

  describe("updateCustomer", () => {
    const customer_data = {
      name: "Luca",
      surname: "Albertini",
      email: "luca.albertini@mail.com",
      phone: "4152635124",
      cFiscale: "LBTLCU75D16O985M",
      comuneResidenza: "Camisano Vicentino",
      cap: "36043",
      via: "Largo Rossi",
      numeroCivico: "82",
      tipoClienteId: "privato"
    }

    it("Should update customer with status code 200", async () => {
      const updatedFields = {
        ...customer_data
      };

      const mockReq = { params: { id: "1"}, body: updatedFields } as any

      await updateCustomer(
        mockReq as any,
        mockRes as any as Response
      )

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.responseData.name).toBe("Luca"),
      expect(mockRes.responseData.surname).toBe("Albertini"),
      expect(mockRes.responseData.email).toBe("luca.albertini@mail.com"),
      expect(mockRes.responseData.phone).toBe("4152635124"),
      expect(mockRes.responseData.cFiscale).toBe("LBTLCU75D16O985M"),
      expect(mockRes.responseData.comuneResidenza).toBe("Camisano Vicentino"),
      expect(mockRes.responseData.cap).toBe("36043"),
      expect(mockRes.responseData.via).toBe("Largo Rossi"),
      expect(mockRes.responseData.numeroCivico).toBe("82"),
      expect(mockRes.responseData.tipoClienteId).toBe("privato")
    });

    it("Should return 404 if customer id does not exist", async () => {
      const updatedFields = {
        ...customer_data
      };

      const mockReq = { params: { id: "non-existent-id" }, body: updatedFields } as any;

      await updateCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.responseData).toHaveProperty("error");
    });

    it("Should return 400 due to missing parameter", async () => {
      const updatedFields = {
        ...customer_data
      };

      const mockReq = { params: { }, body: updatedFields } as any;

      await updateCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData).toHaveProperty("error");
    });

    it("Should fail with code 500 due to database error", async () => {
      const mockReq = { params: {id: "1"}, body: {...customer_data} } as any;

      mockPrismaCustomer.update.mockRejectedValueOnce(
        new Error("Error in the database, impossible to continue")
      );

      await updateCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData).toHaveProperty("error");
    });
  });

  describe("deleteCustomer", () => {
    it("Should delete a customer with code 200", async () => {
      const mockReq = {params: {id: "1"}, body: {}};

      await deleteCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.responseData).toHaveProperty("message");
    });

    it("Should fail with code 404 due to customer not present", async () => {
      const mockReq = {params: {id: "not-valid-id"}, body: {}};

      await deleteCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.responseData).toHaveProperty("error");
    });

    it("Should return 400 due to missing parameter", async () => {
      const mockReq = { params: { }, body: {} } as any;

      await deleteCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData).toHaveProperty("error");
    });

    it("Should fail with code 500 due to database error", async () => {
      const mockReq = {params: {id: "1"}, body: {}};

      mockPrismaCustomer.delete.mockRejectedValueOnce(
        new Error("Error in the database, impossible to continue")
      );

      await deleteCustomer(
        mockReq as any,
        mockRes as any as Response
      );

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData).toHaveProperty("error");
    });
  });
});