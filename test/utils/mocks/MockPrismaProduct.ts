import { mock } from "bun:test";

export const product1 = {
    id: "1",
    codiceProdotto: "P001",
    codiceColore: "C001",
    descrizione: "Colla forte",
    tipoProdottoId: "1",
    produttoreId: "1",
    dimensione: "500ml",
    unitàPerScatola: 12,
    prezzo: 9.99,
    createdAt: new Date(),
    updatedAt: new Date()
}

export const product2 = {
    id: "2",
    codiceProdotto: "P002",
    codiceColore: "C002",
    descrizione: "Mattonella forte",
    tipoProdottoId: "2",
    produttoreId: "2",
    dimensione: "40x20cm",
    unitàPerScatola: 50,
    prezzo: 40.99,
    createdAt: new Date(),
    updatedAt: new Date()
}

export const product3 = {
    id: "3",
    codiceProdotto: "P003",
    codiceColore: "C003",
    descrizione: "consulenza",
    tipoProdottoId: "4",
    produttoreId: "1",
    dimensione: "2ore",
    unitàPerScatola: null,
    prezzo: 79.99,
    createdAt: new Date(),
    updatedAt: new Date()
}

const mockPrismaProduct = {
    findMany: mock((params) => {
        const where = params?.where;

        const products = [product1, product2, product3];
        if(!where) {
            return products;
        }

        return products.filter(prod => prod.produttoreId === where.produttoreId);
    }),
    findUnique: mock(({ where }) => {
        switch(where.id) {
            case product1.id:
                return product1;
            case product2.id:
                return product2;
            case product3.id:
                return product3;
            default:
                return null;
        }
    }),
    create: mock(({ data }) => {
        return {
            id: "new-id",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }),
    update: mock(({ where, data }) => {
        switch(where.id) {
            case product1.id:
                return {
                    ...product1,
                    ...Object.fromEntries(
                        Object.entries(data).filter(([_, v]) => v !== undefined)
                    )
                };
            case product2.id:
                return {
                    ...product2,
                    ...Object.fromEntries(
                        Object.entries(data).filter(([_, v]) => v !== undefined)
                    )
                };
            case product3.id:
                return {
                    ...product3,
                    ...Object.fromEntries(
                        Object.entries(data).filter(([_, v]) => v !== undefined)
                    )
                };
            default:
                return null;
        }
    }),
    delete: mock(({ where }) => {
        switch(where.id) {
            case product1.id:
                return product1;
            case product2.id:
                return product2;
            case product3.id:
                return product3;
            default:
                return null;
        }
    }),
}

export default mockPrismaProduct;