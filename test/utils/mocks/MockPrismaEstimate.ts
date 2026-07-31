import { mock } from "bun:test";

const estimate1 = {
    id: "1",
    customerId: "1",
    dataScadenza: new Date("2026-08-29"),
    nota: "Preventivo per mattonelle belle",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const estimate2 = {
    id: "2",
    customerId: "2",
    dataScadenza: new Date("2026-08-15"),
    nota: "Preventivo per mattonelle rosse",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const estimate3 = {
    id: "3",
    customerId: "1",
    dataScadenza: new Date("2026-08-21"),
    nota: "Preventivo per mattonelle brutte",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const estimates = {
    "1": estimate1,
    "2": estimate2,
    "3": estimate3,
}

const mockPrismaEstimate = {
    findMany: mock((params) => {
        const where = params?.where;

        if (where?.customerId) {
            return Object.values(estimates).filter(
                estimate => estimate.customerId === where.customerId
            );
        }

        return [
            estimate1,
            estimate2,
            estimate3,
        ]
    }),

    findUnique: mock(({ where }) => {
        if (where.id === "1")
            return estimate1;
        else if (where.id === "2")
            return estimate2;
        else if (where.id === "3")
            return estimate3;

        return null;
    }),

    create: mock(({ data }) => {
        return {
            id: "new-id",
            ...data,
            customerId: data?.customer?.connect?.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }),

    update: mock(({ where , data}) => {
        const estimate = estimates[where.id];
        if (!estimate) return null;

        return {
            ...estimate,
            ...data
        };
    }),

    delete: mock(({ where }) => {
        const estimate = estimates[where.id];
        if (!estimate) return null;

        return {
            ...estimate
        };
    }),
}

export default mockPrismaEstimate;