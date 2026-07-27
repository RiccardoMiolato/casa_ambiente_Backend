import express from "express";
import { createProducer, deleteProducer, getAllProducers, getProducerById, updateProducer } from "../controllers/producerController";

const router = express.Router();

// GET /producers
router.get("/", getAllProducers);

// GET /producers/:id
router.get("/:id", getProducerById);

// POST /producers
router.post("/", createProducer);

// PUT /producers/:id
router.put("/:id", updateProducer);

// DELETE /producers/:id
router.delete("/:id", deleteProducer);

export default router;