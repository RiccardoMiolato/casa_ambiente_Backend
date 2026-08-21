import { prisma } from "../../../src/lib/prisma";

export async function insertCustomerType(
    tipoCliente: string
) {
    const customerType = await prisma.tipologiaCliente.create({
        data: {
            tipoCliente
        }
    });

    return customerType;
}