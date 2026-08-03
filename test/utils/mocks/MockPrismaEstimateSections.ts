import { mock } from "bun:test";

const estimate1Section1 = {
    id: "1",
    nome: "Parte uno",
    preventivoId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const estimate1Section2 = {
    id: "2",
    nome: "Parte uno",
    preventivoId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
};


const estimate2Section1 = {
    id: "3",
    nome: "Parte uno",
    preventivoId: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const estimate2Section2 = {
    id: "4",
    nome: "Parte uno",
    preventivoId: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockPrismaEstimateSections = {
    findMany: mock(({ where }) => {
        if (where.preventivoId === "1") {
            return [
                estimate1Section1,
                estimate1Section2
            ];
        } else if (where.preventivoId === "2") {
            return [
                estimate2Section1,
                estimate2Section2
            ];
        }
        return [];
    }),
    findUnique: mock(({ where }) => {
        switch(where.id) {
            case "1":
                return estimate1Section1;
            case "2":
                return estimate1Section2;
            case "3":
                return estimate2Section1;
            case "4":
                return estimate2Section2;
            default:
                return null;
        }
    }),
    create: mock(({ data }) => {
        return {
            id: "new-id",
            nome: data.nome,
            preventivoId: data?.preventivo?.connect?.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }),
    update: mock(({ where, data }) => {
        switch(where.id) {
            case "1":
                return {
                    ...estimate1Section1,
                    ...data,
                    updatedAt: new Date(),
                };
            case "2":
                return {
                    ...estimate1Section2,
                    ...data,
                    updatedAt: new Date(),
                };
            case "3":
                return {
                    ...estimate2Section1,
                    ...data,
                    updatedAt: new Date(),
                };
            case "4":
                return {
                    ...estimate2Section2,
                    ...data,
                    updatedAt: new Date(),
                };
            default:
                return null;
        }
    }),
    delete: mock(({ where }) => {
        switch(where.id) {
            case "1":
                return estimate1Section1;
            case "2":
                return estimate1Section2;
            case "3":
                return estimate2Section1;
            case "4":
                return estimate2Section2;
            default:
                return null;
        };
    }),
};

export default mockPrismaEstimateSections;