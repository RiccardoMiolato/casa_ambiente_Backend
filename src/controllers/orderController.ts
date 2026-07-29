import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.ordiniMagazzino.findMany();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const order = await prisma.ordiniMagazzino.findUnique({
            where: { id: id },
        });
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ error: "Order not found" });
        }
    } catch (error) {
        console.error(`Error fetching order with ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getOrdersByCustomerId = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    try {
        const orders = await prisma.ordiniMagazzino.findMany({
            where: { clienteId: customerId },
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error(`Error fetching orders for customer ID ${customerId}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createOrder = async (req: Request, res: Response) => {
    const {
        clienteId,
        tipologia,
        nome } = req.body;

    if (!nome || ! tipologia) {
        return res.status(400).json({
            error: "Missing required fields: nome and tipologia are required"
        })
    }

    try {
        const newOrder = await prisma.ordiniMagazzino.create({
            data: {
                clienteId,
                nome,
                tipologia,
            },
        });
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { clienteId, tipologia, nome } = req.body;

    try {
        const updatedOrder = await prisma.ordiniMagazzino.update({
            where: { id: id },
            data: { clienteId, tipologia, nome },
        });
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error(`Error updating order with ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.ordiniMagazzino.delete({
            where: { id: id },
        });
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting order with ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}


/**
 * ORDERS PRODUDUCTS NxN relationship
 */

export const addProductToOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({
            error: "Missing required fields: productId and quantity are required"
        })
    }

    try {
        const orderProduct = await prisma.prodottoOrdine.create({
            data: {
                quantità: quantity,
                movimento: {
                    connect: { id: orderId }
                },
                prodotto: {
                    connect: { id: productId }
                }
            }
        })
        res.status(201).json(orderProduct);
    } catch (error) {
        console.error(`Error adding product to order with ID ${orderId}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateProductInOrder = async (req: Request, res: Response) => {
    const { orderId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
        return res.status(400).json({
            error: "Missing required field: quantity is required"
        })
    }

    try {
        const updatedOrderProduct = await prisma.prodottoOrdine.update({
            where: {
                movimentoId: orderId,
                prodottoId: productId
            },
            data: {
                quantità: quantity
            }
        });

        if (!updatedOrderProduct) {
            return res.status(404).json({
                error: `Order ${orderId} with product ${productId} not foud`
            });
        }

        res.status(200).json(updatedOrderProduct);
    } catch (error) {
        console.error(`Error updating product in order with ID ${orderId}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const removeProductFromOrder = async (req: Request, res: Response) => {
    const { orderId, productId } = req.params;

    try {
        const orderProduct = await prisma.prodottoOrdine.findUnique({
            where: {
                movimentoId: orderId,
                prodottoId: productId
            }
        })

        if (!orderProduct) {
            return res.status(404).json({
                error: `Product ${productId} not found for order ${orderId}`
            });
        }

        await prisma.prodottoOrdine.delete({
            where: {
                movimentoId: orderId,
                prodottoId: productId
            }
        });
        res.status(204).send();
    } catch (error) {
        console.error(`Error removing product from order with ID ${orderId}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}