import { mock } from "bun:test";

const order1 = {
    id: "1",
    clienteId: "1",
    nome: "Ordine numero 1",
    tipologia: "Ingresso",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const order2 = {
    id: "2",
    clienteId: "1",
    nome: "Ordine numero 2",
    tipologia: "Ingresso",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const order3 = {
    id: "3",
    clienteId: "2",
    nome: "Ordine numero 3",
    tipologia: "Ingresso",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const orders = [order1, order2, order3];

const mockPrismaOrder = {
    findMany: mock((params) => {
        if(!params?.where)
            return orders;

        return orders.filter(order => order.clienteId === params.where.clienteId);
    }),
    findUnique: mock(({where}) => {
        return orders.find(order => order.id === where.id) || null;
    }),
    create: mock(({data}) => {
        return {
            id: "new-id",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }),
    update: mock(({where, data}) => {
        const orderToUpdate = orders.find(order => order.id === where.id) || null;

        if(orderToUpdate)
            return {
                ...orderToUpdate,
                ...Object.fromEntries(
                    Object.entries(data).filter(([_, v]) => v !== undefined)
                )
            };

        return null;
    }),
    delete: mock(({where}) => {
        return orders.find(order => order.id === where.id) || null
    }),
}

export default mockPrismaOrder;