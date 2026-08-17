import express from "express";
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrder } from "../controllers/orderController";

const router = express.Router();

// GET /orders
router.get("/", getAllOrders);

// GET /orders/:id
router.get("/:id", getOrderById);

// POST /orders
router.post("/", createOrder);

// PUT /orders/:id
router.put("/:id", updateOrder);

// DELETE /orders/:id
router.delete("/:id", deleteOrder);

export default router;