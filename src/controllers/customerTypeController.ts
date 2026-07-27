import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllCustomerTypes = async (req: Request, res: Response) => {
    try {
        const customerTypes = await prisma.tipologiaCliente.findMany();
        res.json(customerTypes);
    } catch (error) {
        console.error("Error fetching customer types:", error);
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
        console.error("Error creating customer type:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteCustomerType = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedCustomerType = await prisma.tipologiaCliente.delete({
            where: { id: id },
        });

        if (!deletedCustomerType) {
            return res.status(404).json({ error: "Customer type not found" });
        }

        res.json(deletedCustomerType);
    } catch (error) {
        console.error("Error deleting customer type:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}