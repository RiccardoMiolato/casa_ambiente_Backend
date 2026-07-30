import type { Request, Response } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import { prisma as default_prisma } from "../lib/prisma";

export const getAllCustomers = async (req: Request, res: Response, prisma: PrismaClient = default_prisma) => {
    try {
        const customers = await prisma.customer.findMany();
        res.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getCustomerById = async (req: Request, res: Response, prisma: PrismaClient = default_prisma) => {
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
        console.error(`Error fetching customer with ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createCustomer = async (req: Request, res: Response, prisma: PrismaClient = default_prisma) => {
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
        console.error("Error creating customer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateCustomer = async (req: Request, res: Response, prisma: PrismaClient = default_prisma) => {
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
        console.error(`Error updating customer with ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteCustomer = async (req: Request, res: Response, prisma: PrismaClient = default_prisma) => {
    const { id } = req.params;
    try {
        const deletedCustomer = await prisma.customer.delete({
            where: { id: id },
        });
        if (!deletedCustomer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error(`Error deleting customer with ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}