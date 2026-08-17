import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * PRODUCT PART
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.prodotto.findMany();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
}

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const product = await prisma.prodotto.findUnique({
            where: { id: id },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
}

export const getProductsByProducerId = async (req: Request, res: Response) => {
    const { id } = req.params; // Producer ID

    try {
        const products = await prisma.prodotto.findMany({
            where: { produttoreId: id },
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products for the producer" });
    }
}

export const createProduct = async (req: Request, res: Response) => {
    const {
        codiceProdotto,
        codiceColore,
        descrizione,
        tipoProdottoId,
        produttoreId,
        dimensione,
        unitàPerScatola,
        prezzo
    } = req.body;

    if (
        !codiceProdotto ||
        !codiceColore ||
        !descrizione ||
        !tipoProdottoId ||
        !produttoreId ||
        !dimensione ||
        !unitàPerScatola ||
        !prezzo
    ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingProducer = await prisma.produttore.findUnique({
            where: { id: produttoreId },
        });
        if(!existingProducer){
            return res.status(404).json({ error: "Producer not found" });
        }

        const existingProductType = await prisma.tipologiaProdotto.findUnique({
            where: { id: tipoProdottoId },
        });
        if(!existingProductType){
            return res.status(404).json({error: "Product type not found"})
        }

        const newProduct = await prisma.prodotto.create({
            data: {
                codiceProdotto,
                codiceColore,
                descrizione,
                dimensione,
                unitàPerScatola,
                prezzo,
                tipoProdotto: {
                    connect: {id: tipoProdottoId},
                },
                produttore: {
                    connect: {id: produttoreId},
                },
            },
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        codiceProdotto,
        codiceColore,
        descrizione,
        tipoProdottoId,
        produttoreId,
        dimensione,
        unitàPerScatola,
        prezzo
    } = req.body;

    try {
        const existingProduct = await prisma.prodotto.findUnique({
            where: { id: id },
        });
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        if(produttoreId) {
            const existingProducer = await prisma.produttore.findUnique({
                where: { id: produttoreId },
            });
            if(!existingProducer){
                return res.status(404).json({ error: "Producer not found" });
            }
        }

        if(tipoProdottoId) {
            const existingProductType = await prisma.tipologiaProdotto.findUnique({
                where: { id: tipoProdottoId },
            });
            if(!existingProductType){
                return res.status(404).json({error: "Product type not found"})
            }
        }

        const updatedProduct = await prisma.prodotto.update({
            where: { id: id },
            data: {
                codiceProdotto,
                codiceColore,
                descrizione,
                tipoProdottoId,
                produttoreId,
                dimensione,
                unitàPerScatola,
                prezzo
            },
        });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const existingProduct = await prisma.prodotto.findUnique({
            where: { id: id },
        });
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        await prisma.prodotto.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
}

/**
 * PRODUCT TYPE PART
 */
export const getAllProductTypes = async (req: Request, res: Response) => {
    try {
        const productTypes = await prisma.tipologiaProdotto.findMany();
        res.status(200).json(productTypes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product types" });
    }
};

export const getProductTypeById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const productType = await prisma.tipologiaProdotto.findUnique({
            where: { id: id },
        });
        if (!productType) {
            return res.status(404).json({ error: "Product type not found" });
        }
        res.status(200).json(productType);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product type" });
    }
}

export const createProductType = async (req: Request, res: Response) => {
    const { tipoProdotto } = req.body;

    if (!tipoProdotto) {
        return res.status(400).json({
            error: "tipoProdotto is required"
        });
    }

    try {
        const newProductType = await prisma.tipologiaProdotto.create({
            data: {
                tipoProdotto
            },
        });
        res.status(201).json(newProductType);
    } catch (error) {
        res.status(500).json({ error: "Failed to create product type" });
    }
}

export const updateProductType = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tipoProdotto } = req.body;

    if(!id)
        return res.status(400).json({error: "Missing id parameter in the request"});

    if(!tipoProdotto){
        return res.status(400).json({error: "tipoProdotto is required"});
    }

    try {
        const existingProductType = await prisma.tipologiaProdotto.findUnique({
            where: { id: id },
        });
        if (!existingProductType) {
            return res.status(404).json({ error: "Product type not found" });
        }

        const updatedProductType = await prisma.tipologiaProdotto.update({
            where: { id: id },
            data: { tipoProdotto },
        });
        res.status(200).json(updatedProductType);
    } catch (error) {
        res.status(500).json({ error: "Failed to update product type" });
    }
}

export const deleteProductType = async (req: Request, res: Response) => {
    const { id } = req.params;

    if(!id)
        return res.status(400).json({error: "Missing id parameter in the request"});

    try {
        const existingProductType = await prisma.tipologiaProdotto.findUnique({
            where: { id: id },
        });
        if (!existingProductType) {
            return res.status(404).json({ error: "Product type not found" });
        }

        await prisma.tipologiaProdotto.delete({
            where: { id: id },
        });
        res.status(204);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product type" });
    }
}
