import { mock } from "bun:test";

const producer1 = {
    id: "1",
    nome: "Azienda 1",
    email: "contatti@azienda1.it",
    telefono: "1247584563",
    sitoweb: "www.azienda1.it",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const producer2 = {
    id: "2",
    nome: "Azienda 2",
    email: "contatti@azienda2.it",
    telefono: "7412548745",
    sitoweb: "www.azienda2.it",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const producer3 = {
    id: "3",
    nome: "Azienda 3",
    email: "contatti@azienda3.it",
    telefono: "1234521684",
    sitoweb: "www.azienda3.it",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockPrismaProducer = {
    findMany: mock(() => [producer1, producer2, producer3]),
    findUnique: mock(({ where }) => {
        switch(where.id) {
            case "1":
                return producer1;
            case "2":
                return producer2;
            case "3":
                return producer3;
            default:
                return null;
        }
    }),
    create: mock(({ data }) => {
        return {
            id: "new-id",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }),
    update: mock(({ where, data}) => {
        switch(where.id) {
            case "1":
                return {
                    ...producer1,
                    ...Object.fromEntries(
                        Object.entries(data).filter(([_, v]) => v !== undefined)
                    ),
                    updatedAt: new Date(),
                };
            case "2":
                return {
                    ...producer2,
                    ...Object.fromEntries(
                        Object.entries(data).filter(([_, v]) => v !== undefined)
                    ),
                    updatedAt: new Date(),
                };
            case "3":
                return {
                    ...producer3,
                    ...Object.fromEntries(
                        Object.entries(data).filter(([_, v]) => v !== undefined)
                    ),
                    updatedAt: new Date(),
                };
            default:
                return null;
        }
    }),
    delete: mock(({ where }) => {
        switch(where.id) {
            case "1":
                return producer1;
            case "2":
                return producer2;
            case "3":
                return producer3;
            default:
                return null;
        }
    }),
}

export default mockPrismaProducer;