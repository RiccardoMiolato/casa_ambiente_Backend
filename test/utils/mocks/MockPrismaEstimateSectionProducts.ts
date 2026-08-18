import { mock } from "bun:test";

const prod1Section1 = {
    sezioneId: "1",
    prodottoId: "1",
    quantity: 5,
}

const prod2Section1 = {
    sezioneId: "1",
    prodottoId: "2",
    quantity: 3,
}

const prod1Section2 = {
    sezioneId: "2",
    prodottoId: "1",
    quantity: 7,
}

const mockPrismaEstimateSectionProducts = {
    findUnique: mock(({ where }) => {
        if (where.sezioneId === "1" && where.prodottoId === "1") return prod1Section1;
        else if (where.sezioneId === "1" && where.prodottoId === "2") return prod2Section1;
        else if (where.sezioneId === "2" && where.prodottoId === "1") return prod1Section2;
        else return null;
    }),
    create: mock(({ data }) => ({
        ...data,
    })),
    update: mock(({ where, data }) => ({
        sezioneId: where?.sezioneId,
        prodottoId: where?.prodottoId,
        ...data,
    })),
    delete: mock(({ where }) => ({
        sezioneId: where?.sezioneId,
        prodottoId: where?.prodottoId,
    })),
};

export default mockPrismaEstimateSectionProducts;