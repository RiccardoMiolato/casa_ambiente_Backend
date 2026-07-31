import { mock } from "bun:test";

const mockPrismaCustomer = {
  findMany: mock(async () => [
    {
      id: "1",
      name: "John",
      surname: "Doe",
      email: "john@example.com",
      phone: "1234567890",
      pIva: null,
      cFiscale: "ABC123",
      comuneResidenza: "Roma",
      cap: "00100",
      via: "Via Roma",
      numeroCivico: "1",
      tipoClienteId: "type-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),

  findUnique: mock(async ({ where }: any) => {
    if (where.id === "1") {
      return {
        id: "1",
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        pIva: null,
        cFiscale: "ABC123",
        comuneResidenza: "Roma",
        cap: "00100",
        via: "Via Roma",
        numeroCivico: "1",
        tipoClienteId: "type-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }else if (where.id === "3") {
      return {
        id: "3",
        name: "Albert",
        surname: "Gilbert",
        email: "albert@example.com",
        phone: "1234567890",
        pIva: null,
        cFiscale: "ABC123",
        comuneResidenza: "Roma",
        cap: "00100",
        via: "Via Roma",
        numeroCivico: "1",
        tipoClienteId: "type-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    return null;
  }),

  create: mock(async ({ data }: any) => ({
    id: "new-id",
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),

  update: mock(async ({ where, data }: any) => {
    if (where.id === "1") {
      return {
        id: where.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return null;
  }),

  delete: mock(async ({ where }: any) => {
    if (where.id === "1") {
      return {
        id: where.id,
        name: "John",
      }
    }

    return null;
  }),
};

export default mockPrismaCustomer;
