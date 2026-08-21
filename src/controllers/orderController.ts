import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.ordiniMagazzino.findMany();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if(!id)
        return res.status(400).json({ error: "Missing required parameter: id" });

    try {
        const order = await prisma.ordiniMagazzino.findUnique({
            where: { id: id },
        });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getOrdersByCustomerId = async (req: Request, res: Response) => {
    const { customerId } = req.params;

    if(!customerId)
        return res.status(400).json({ error: "Missing required parameter: customerId" });

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });
        if(!customer) {
            return res.status(404).json({ error: "Customer not found" });
        };

        const orders = await prisma.ordiniMagazzino.findMany({
            where: { clienteId: customerId },
        });
        res.status(200).json(orders);
    } catch (error) {
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
        const customer = await prisma.customer.findUnique({
            where: { id: clienteId },
        });
        if(!customer) {
            return res.status(404).json({ error: "Customer not found" });
        };

        const newOrder = await prisma.ordiniMagazzino.create({
            data: {
                clienteId,
                nome,
                tipologia,
            },
        });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { clienteId, tipologia, nome } = req.body;

    if(!id)
        return res.status(400).json({ error: "Missing required parameter: id" });

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: clienteId },
        });
        if(!customer) {
            return res.status(404).json({ error: "Customer not found" });
        };

        const order = await prisma.ordiniMagazzino.findUnique({
            where: { id: id}
        });
        if(!order)
            return res.status(404).json({ error: "Order not found" });

        const updatedOrder = await prisma.ordiniMagazzino.update({
            where: { id: id },
            data: { clienteId, tipologia, nome },
        });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    if(!id)
        return res.status(400).json({ error: "Missing required parameter: id" });

    try {
        const order = await prisma.ordiniMagazzino.findUnique({
            where: { id: id}
        });
        if(!order)
            return res.status(404).json({ error: "Order not found" });

        await prisma.ordiniMagazzino.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}


/**
 * ORDERS PRODUDUCTS NxN relationship
 */

export const addProductToOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { productId, quantity } = req.body;

    if(!orderId)
        return res.status(400).json({ error: "Missing required parameter: orderId" });

    if (!productId || !quantity) {
        return res.status(400).json({
            error: "Missing required fields: productId and quantity are required"
        })
    }

    if(quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    try {
        const order = await prisma.ordiniMagazzino.findUnique({
            where: {id: orderId}
        });
        if(!order)
            return res.status(404).json({ error: "Order not found"});

        const product = await prisma.prodotto.findUnique({
            where: {id: productId}
        });
        if(!product)
            return res.status(404).json({ error: "Product not found"});

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
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateProductInOrder = async (req: Request, res: Response) => {
    const { orderId, productId } = req.params;
    const { quantity } = req.body;

    if(!orderId || !productId) {
        return res.status(400).json({ error: "Missing required parameters: orderId and productId are required" });
    }

    if (!quantity) {
        return res.status(400).json({ error: "Missing required field: quantity is required" });
    }

    if(quantity < 0) {
        return res.status(400).json({ error: "Quantity must be greater than or equal to 0" });
    }

    try {
        const order = await prisma.ordiniMagazzino.findUnique({
            where: {id: orderId}
        });
        if(!order)
            return res.status(404).json({ error: "Order not found"});

        const product = await prisma.prodotto.findUnique({
            where: {id: productId}
        });
        if(!product)
            return res.status(404).json({ error: "Product not found"});

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
        res.status(500).json({ error: "Internal server error" });
    }
}

export const removeProductFromOrder = async (req: Request, res: Response) => {
    const { orderId, productId } = req.params;

    if(!orderId || !productId) {
        return res.status(400).json({ error: "Missing required parameters: orderId and productId are required" });
    }

    try {
        const orderProduct = await prisma.prodottoOrdine.findUnique({
            where: {
                prodottoId: productId,
                movimentoId: orderId
            }
        });

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
        res.status(200).json({ message: "Product removed from order successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}