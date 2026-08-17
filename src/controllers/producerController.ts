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

    if(!id)
        return res.status(400).json({ error: "Missing id parameter in the request"});

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

    if(!nome || !email || !telefono || !sitoweb){
        return res.status(400).json({error: "Request is badly formatted, check the presence of all required fields such as\nnome, email, telefono, sitoweb"});
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

    if(!id)
        return res.status(400).json({ error: "Missing required parameter: id"});

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

        if(!updatedProducer)
            return res.status(404).json({error: `Producer with id ${id} not found`});

        res.status(200).json(updatedProducer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update producer' });
    }
}

export const deleteProducer = async (req: Request, res: Response) => {
    const { id } = req.params;

    if(!id)
        return res.status(400).json({ error: "Missing required parameter: id"});

    try {
        const produttore = await prisma.produttore.findUnique({
            where: {id: id}
        });

        if(!produttore)
            return res.status(404).json({error: `Producer with id ${id} not found`});

        await prisma.produttore.delete({
            where: { id: id },
        });
        res.status(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete producer' });
    }
}