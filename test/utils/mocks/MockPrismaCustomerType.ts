import { mock } from "bun:test";

const obj1 = {
    id: "1",
    tipoCliente: "privato",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const obj2 = {
    id: "2",
    tipoCliente: "rivenditore",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockPrismaCustomerType = {
    findMany: mock(() => [
        obj1,
        obj2
    ]),
    findUnique: mock(({ where }) => {
        if (where.id === "1")
            return obj1;
        else if (where.id === "2")
            return obj2
        else
            return null;
    }),
    create: mock(({ data }) => {
        return {
            id: "new-id",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }),
    delete: mock(({ where }) => {
        if (where.id === "1")
            return obj1;
        else if (where.id === "2")
            return obj2
        else
            return null;
    })
}

export default mockPrismaCustomerType;