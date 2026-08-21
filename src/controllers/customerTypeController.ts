import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllCustomerTypes = async (req: Request, res: Response) => {
    try {
        const customerTypes = await prisma.tipologiaCliente.findMany();
        res.json(customerTypes);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createCustomerType = async (req: Request, res: Response) => {
    const { tipoCliente } = req.body;
    if (!tipoCliente) {
        return res.status(400).json({ error: "Missing required field: tipoCliente" });
    }
    try {
        const newCustomerType = await prisma.tipologiaCliente.create({
            data: { tipoCliente },
        });

        res.status(201).json(newCustomerType);
    } catch (error) {
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({
                error: "Cannot duplicate customer type value",
            });
        }

        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteCustomerType = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id)
        return res.status(400).json({error: "Missing parameter in the request: id"});

    try {
        const customerType = await await prisma.tipologiaCliente.findUnique({
            where: { id: id },
        });
        if (!customerType) {
            return res.status(404).json({ error: "Customer type not found" });
        }

        const deletedCustomerType = await prisma.tipologiaCliente.delete({
            where: { id: id },
        });

        res.json(deletedCustomerType);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}