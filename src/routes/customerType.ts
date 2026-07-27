// src/routes/users.ts
import express from "express";
import { createCustomerType, deleteCustomerType, getAllCustomerTypes } from "../controllers/customerTypeController";
const router = express.Router();

// GET /customer/types
router.get("/", getAllCustomerTypes);

// POST /customer/types
router.post("/", createCustomerType);

// DELETE /customer/types/:id
router.delete("/:id", deleteCustomerType);

export default router;