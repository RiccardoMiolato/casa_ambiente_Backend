import { prisma } from "../../../src/lib/prisma";

export async function insertCustomer(
    name: string,
    surname: string,
    email: string,
    phone: string,
    pIva: string | null,
    cFiscale: string,
    comuneResidenza: string,
    cap: string,
    via: string | null,
    numeroCivico: string | null,
    tipoClienteId: string
) {
    const customer = await prisma.customer.create({
        data: {
            name,
            surname,
            email,
            phone,
            pIva,
            cFiscale,
            comuneResidenza,
            cap,
            via,
            numeroCivico,
            tipoClienteId
        }
    });

    return customer;
}