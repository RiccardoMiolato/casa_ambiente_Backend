import express from "express";
import { createProducer, deleteProducer, getAllProducers, getProducerById, updateProducer } from "../controllers/producerController";
import { getProductsByProducerId } from "../controllers/productController";

const router = express.Router();

// GET /producers
router.get("/", getAllProducers);

// GET /producers/:id
router.get("/:id", getProducerById);

// GET /producers/:id/products
router.get("/:id/products", getProductsByProducerId);

// POST /producers
router.post("/", createProducer);

// PUT /producers/:id
router.put("/:id", updateProducer);

// DELETE /producers/:id
router.delete("/:id", deleteProducer);

export default router;