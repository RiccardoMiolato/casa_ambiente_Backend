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
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getEstimateById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id){
        return res.status(400).json({
            error: "Missing id parameter"
        });
    }

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: id },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        res.json(estimate);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getEstimatesByCustomerId = async (req: Request, res: Response) => {
    const { customerId } = req.params;

    if(!customerId) {
        return res.status(400).json({
            error: "Missing customerId, impossible to proceed"
        });
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: {id: customerId}
        });
        if(!customer){
            return res.status(404).json({error: `No customer found with id ${customerId}`})
        }

        const estimates = await prisma.preventivo.findMany({
            where: { customerId: customerId },
        });
        if (!estimates || estimates.length === 0) {
            return res.status(404).json({ error: "No estimates found for this customer" });
        }

        res.json(estimates);
    } catch (error) {
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

        // Ensure dataScadenza is a valid date and remove time component
        const parsedDate = new Date(dataScadenza);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format for dataScadenza" });
        }
        // Set time to midnight (00:00:00) to keep only the date
        parsedDate.setUTCHours(0, 0, 0, 0);

        const newEstimate = await prisma.preventivo.create({
            data: {
                dataScadenza: parsedDate,
                nota,
                customer: {
                    connect: { id: customerId },
                },
            },
        });

        res.status(201).json(newEstimate);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateEstimate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        dataScadenza,
        nota,
    } = req.body;

    if (!id)
        return res.status(400).json({error: "Missing required params: id"});

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: id },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        if (dataScadenza) {
            // Ensure dataScadenza is a valid date and remove time component
            const parsedDate = new Date(dataScadenza);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ error: "Invalid date format for dataScadenza" });
            }
            // Set time to midnight (00:00:00) to keep only the date
            parsedDate.setUTCHours(0, 0, 0, 0);
        }

        const updatedEstimate = await prisma.preventivo.update({
            where: { id: id },
            data: {
                dataScadenza: new Date(dataScadenza),
                nota,
            },
        });

        res.json(updatedEstimate);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteEstimate = async (req: Request, res: Response) => {
    const { id } = req.params;

    if(!id)
        return res.status(400).json({error: "Missing required parameter: id"})

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

        res.status(204);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Estimate sections controller part
 */
export const getSectionsByEstimateId = async (req: Request, res: Response) => {
    const { estimateId } = req.params;

    if (!estimateId)
        return res.status(400).json({
            error: "Missing required parameter: estimateId"
        });

    try {
        const sections = await prisma.sezionePreventivo.findMany({
            where: { preventivoId: estimateId },
        });

        if (!sections || sections.length === 0) {
            return res.status(404).json({ error: "No sections found for this estimate" });
        }

        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const addSectionToEstimate = async (req: Request, res: Response) => {
    const { estimateId } = req.params;
    const { nome } = req.body;

    if (!estimateId) {
        return res.status(400).json({ error: "Missing required parameter: estimateId" });
    }

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
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateSectionNameInEstimate = async (req: Request, res: Response) => {
    const { estimateId, sectionId } = req.params;
    const { nome } = req.body;

    if (!estimateId) {
        return res.status(400).json({ error: "Missing required parameter: estimateId" });
    }

    if (!sectionId) {
        return res.status(400).json({ error: "Missing required parameter: sectionId" });
    }

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
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteSectionFromEstimate = async (req: Request, res: Response) => {
    const { estimateId, sectionId } = req.params;

    if (!estimateId) {
        return res.status(400).json({ error: "Missing required parameter: estimateId" });
    }

    if (!sectionId) {
        return res.status(400).json({ error: "Missing required parameter: sectionId" });
    }

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: estimateId },
        });

        if (!estimate) {
            return res.status(404).json({ error: "Estimate not found" });
        }

        const section = await prisma.sezionePreventivo.findUnique({
            where: { id: sectionId },
        });

        if (!section) {
            return res.status(404).json({ error: "Section not found for this estimate" });
        }

        if(section.preventivoId !== estimateId) {
            return res.status(409).json({ error: "Section estimate does not correspond to the passed estimateId"});
        }

        await prisma.sezionePreventivo.delete({
            where: { id: sectionId },
        });

        res.status(204);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * SECTION-PRODUCTS CONTROLLER PART
 */
export const getProductsBySectionId = async (req: Request, res: Response) => {
    const { estimateId, sectionId } = req.params;

    try {
        const estimate = await prisma.preventivo.findUnique({
            where: { id: estimateId }
        });

        if(!estimate) {
            return res.status(404).json({ error: "Estimate not found"});
        }

        const estimateSection = await prisma.sezionePreventivo.findUnique ({
            where: { id: sectionId },
            include: {
                prodotti: {
                    include: {
                        prodotto: true
                    }
                }
            }
        });

        if (!estimateSection) {
            return res.status(404).json({ error: "Section not found"});
        }

        if(estimateSection.preventivoId !== estimateId) {
            res.status(409).json({ error: "Section does not belong to the specified estimate"});
        }



        res.status(200).json(estimateSection);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const addProductToSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).json({ error: "Missing required field: productId" });
    }

    try {
        const section = await prisma.sezionePreventivo.findUnique({
            where: { id: sectionId },
        });

        if (!section) {
            return res.status(404).json({ error: "Section not found" });
        }

        const product = await prisma.prodotto.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const newSectionProduct = await prisma.prodottoSezione.create({
            data: {
                quantità: quantity,
                prezzo: product.prezzo,
                sezione: {
                    connect: { id: sectionId },
                },
                prodotto: {
                    connect: { id: productId },
                },
            },
        });

        res.status(201).json(newSectionProduct);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateProductQuantityInSection = async (req: Request, res: Response) => {
    const { sectionId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
        return res.status(400).json({ error: "Missing required field: quantity" });
    }

    try {
        const sectionProduct = await prisma.prodottoSezione.findFirst({
            where: {
                sezioneId: sectionId,
                prodottoId: productId,
            },
        });

        if (!sectionProduct) {
            return res.status(404).json({ error: "Product not found in this section" });
        }

        const updatedSectionProduct = await prisma.prodottoSezione.update({
            where: { id: sectionProduct.id },
            data: { quantità: quantity },
        });

        res.json(updatedSectionProduct);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const removeProductFromSection = async (req: Request, res: Response) => {
    const { sectionId, productId } = req.params;

    try {
        const sectionProduct = await prisma.prodottoSezione.findFirst({
            where: {
                sezioneId: sectionId,
                prodottoId: productId,
            },
        });

        if (!sectionProduct) {
            return res.status(404).json({ error: "Product not found in this section" });
        }

        await prisma.prodottoSezione.delete({
            where: { id: sectionProduct.id },
        });

        res.status(204);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}