/**
 * This files manages all functions related to producers management
 */

import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllProducers = async (req: Request, res: Response) => {
    try {
        const producers = await prisma.produttore.findMany();
        res.status(200).json(producers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch producers' });
    }
}

export const getProducerById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const producer = await prisma.produttore.findUnique({
            where: { id: id },
        });
        if (!producer) {
            return res.status(404).json({ error: 'Producer not found' });
        }
        res.status(200).json(producer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch producer' });
    }
}

export const createProducer = async (req: Request, res: Response) => {
    const {
        nome,
        email,
        telefono,
        sitoweb
    } = req.body;

    if(!nome){
        return res.status(400).json({
            error: "Nome is required"
        })
    }

    try {
        const newProducer = await prisma.produttore.create({
            data: {
                nome,
                email,
                telefono,
                sitoweb
            },
        });
        res.status(201).json(newProducer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create producer' });
    }
}

export const updateProducer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        nome,
        email,
        telefono,
        sitoweb
    } = req.body;
    try {
        const updatedProducer = await prisma.produttore.update({
            where: { id: id },
            data: {
                nome,
                email,
                telefono,
                sitoweb
            },
        });
        res.status(200).json(updatedProducer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update producer' });
    }
}

export const deleteProducer = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.produttore.delete({
            where: { id: id },
        });
        res.status(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete producer' });
    }
}