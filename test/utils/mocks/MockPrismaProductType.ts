import { mock } from "bun:test";

const prodType1 = {
    id: "1",
    tipoProdotto: "Colla",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const prodType2 = {
    id: "2",
    tipoProdotto: "Mattonella",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const prodType3 = {
    id: "3",
    tipoProdotto: "Malta",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const prodType4 = {
    id: "4",
    tipoProdotto: "Servizio",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockPrismaProductType = {
    findMany: mock(() => [prodType1, prodType2, prodType3, prodType4]),
    findUnique: mock(({ where }) => {
        if (where.id === prodType1.id) return prodType1;
        if (where.id === prodType2.id) return prodType2;
        if (where.id === prodType3.id) return prodType3;
        if (where.id === prodType4.id) return prodType4;
        return null;
    }),
    create: mock(({ data }) => {
        const newProdType = {
            id: "new-id",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return newProdType;
    }),
    update: mock(({ where, data }) => {
        const prodType = [prodType1, prodType2, prodType3, prodType4].find(pt => pt.id === where.id);
        if (!prodType) return null;

        return {
            ...prodType,
            ...data,
            updatedAt: new Date(),
        };
    }),
    delete: mock(({ where }) => {
        const prodType = [prodType1, prodType2, prodType3, prodType4].find(pt => pt.id === where.id);
        if (!prodType) return null;

        return prodType;
    })
};

export default mockPrismaProductType;