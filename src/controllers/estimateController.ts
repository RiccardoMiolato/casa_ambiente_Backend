/**
 * This file contains the controller functions handling the estimate-related (preventivo)
 * requests in the application.
 */
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Estimate controller part
 */

export const getAllEstimates = async (req: Request, res: Response) => {
    try {
        const estimates = await prisma.preventivo.findMany();
        res.json(estimates);
    } catch (error) {
        console.error("Error fetching estimates:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getEstimateById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: id },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        res.json(estimate);
    } catch (error) {
        console.error("Error fetching estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getEstimatesByCustomerId = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    try {
        const estimates = await prisma.preventivo.findMany({
            where: { customerId: customerId },
        });

        if (!estimates || estimates.length === 0) {
            return res.status(404).json({ error: "No estimates found for this customer" });
        }

        res.json(estimates);
    } catch (error) {
        console.error("Error fetching estimates by customer ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createEstimate = async (req: Request, res: Response) => {
    const {
        customerId,
        dataScadenza,
        nota,
    } = req.body;

    // Handle missing params
    if (!customerId || !dataScadenza) {
        return res.status(400).json({ error: "Missing required fields (customerId or dataScadenza)" });
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const totale: number = 0;
        const newEstimate = await prisma.preventivo.create({
            data: {
            dataScadenza,
            nota,
            customer: {
                connect: { id: customerId },
            },
            },
        });

        res.status(201).json(newEstimate);
    } catch (error) {
        console.error("Error creating estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateEstimate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        dataScadenza,
        nota,
    } = req.body;

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: id },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        const updatedEstimate = await prisma.preventivo.update({
            where: { id: id },
            data: {
                dataScadenza,
                nota,
            },
        });

        res.json(updatedEstimate);
    } catch (error) {
        console.error("Error updating estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteEstimate = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: id },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        await prisma.preventivo.delete({
            where: { id: id },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Estimate sections controller part
 */
export const getSectionsByEstimateId = async (req: Request, res: Response) => {
    const { estimateId } = req.params;
    try {
        const sections = await prisma.sezionePreventivo.findMany({
            where: { preventivoId: estimateId },
        });

        if (!sections || sections.length === 0) {
            return res.status(404).json({ error: "No sections found for this estimate" });
        }

        res.json(sections);
    } catch (error) {
        console.error("Error fetching sections by estimate ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const addSectionToEstimate = async (req: Request, res: Response) => {
    const { estimateId } = req.params;
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: "Missing required field: nome" });
    }

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: estimateId },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        const newSection = await prisma.sezionePreventivo.create({
            data: {
                nome,
                preventivo: {
                    connect: { id: estimateId },
                },
            },
        });

        res.status(201).json(newSection);
    } catch (error) {
        console.error("Error adding section to estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateSectionNameInEstimate = async (req: Request, res: Response) => {
    const { estimateId, sectionId } = req.params;
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: "Missing required field: nome" });
    }

    try {
        const section = await prisma.sezionePreventivo.findUnique({
            where: { id: sectionId },
        });

        if (!section || section.preventivoId !== estimateId) {
            return res.status(404).json({ error: "Section not found for this estimate" });
        }

        const updatedSection = await prisma.sezionePreventivo.update({
            where: { id: sectionId },
            data: { nome },
        });

        res.json(updatedSection);
    } catch (error) {
        console.error("Error updating section name in estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteSectionFromEstimate = async (req: Request, res: Response) => {
    const { estimateId, sectionId } = req.params;

    try {
        const section = await prisma.sezionePreventivo.findUnique({
            where: { id: sectionId },
        });

        if (!section || section.preventivoId !== estimateId) {
            return res.status(404).json({ error: "Section not found for this estimate" });
        }

        await prisma.sezionePreventivo.delete({
            where: { id: sectionId },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting section from estimate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}