import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getCustomerById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            error: "Missing id parameter required for customer retrieval"
        });
    }
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: id },
        });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createCustomer = async (req: Request, res: Response) => {
    const {
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
        tipoClienteId  // this param must be passed from front-end
    } = req.body;
    // Handle missing params
    if (!name || !surname || !email || !phone || (!pIva && !cFiscale) || !comuneResidenza || !cap || !tipoClienteId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newCustomer = await prisma.customer.create({
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
            },
        });
        res.status(201).json(newCustomer);
    }catch (error: any) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
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
    } = req.body;

    if (!id) {
        return res.status(400).json({
            error: "Id not passed, impossible to find customer"
        })
    }
    try {
        const updatedCustomer = await prisma.customer.update({
            where: { id: id },
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
            },
        });
        if (!updatedCustomer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            error: "Id not passed, impossible to find customer"
        })
    }

    try {
        const deletedCustomer = await prisma.customer.delete({
            where: { id: id },
        });
        if (!deletedCustomer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}