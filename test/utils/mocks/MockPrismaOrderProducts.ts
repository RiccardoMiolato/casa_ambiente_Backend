import { mock } from "bun:test";

const prod1order1 = {
    movimentoId: "1",
    prodottoId: "1",
    quantità: 2
}

const prod1order2 = {
    movimentoId: "2",
    prodottoId: "1",
    quantità: 4
}

const prod2order1 = {
    movimentoId: "1",
    prodottoId: "2",
    quantità: 1
}

const orderProds = [prod1order1, prod1order2, prod2order1];

const mockPrismaOrderProducts = {
    findMany: mock(() => orderProds),
    findUnique: mock(({where}) => {
        return orderProds.find(op => op.movimentoId === where.movimentoId && op.prodottoId === where.prodottoId);
    }),
    create: mock(({data}) => {
        return {
            ...data
        }
    }),
    update: mock(({where, data}) => {
        const orderProduct = orderProds.find(op => op.movimentoId === where.movimentoId && op.prodottoId === where.prodottoId);

        return {
            ...orderProduct,
            quantità: data.quantità
        }
    }),
    delete: mock(({where}) => {
        return orderProds.find(op => op.movimentoId === where.movimentoId && op.prodottoId === where.prodottoId);
    }),
}

export default mockPrismaOrderProducts;