import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
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
        const customerType = await prisma.tipologiaCliente.findUnique({
            where: {id: tipoClienteId}
        });
        if (!customerType) {
            return res.status(404).json({ error: "Customer type not found" });
        }

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
                tipoClienteId: tipoClienteId
            },
        });
        res.status(201).json(newCustomer);
    }catch (error: any) {
        if(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
            return res.status(409).json({ error: "Duplicate value detected creating new customer"});

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
        const customer = await prisma.customer.findUnique({
            where: {id: id}
        });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const customerType = await prisma.tipologiaCliente.findUnique({
            where: {id: tipoClienteId}
        });
        if (!customerType) {
            return res.status(404).json({ error: "Customer type not found" });
        }


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

        res.json(updatedCustomer);
    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
            return res.status(409).json({ error: "Duplicate value detected updating customer"});

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
        const customer = await prisma.customer.findUnique({
            where: {id: id}
        });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        await prisma.customer.delete({
            where: { id: id },
        });

        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}