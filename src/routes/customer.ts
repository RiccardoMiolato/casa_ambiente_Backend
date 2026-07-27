// src/routes/users.ts
import express from "express";
import { createCustomer, deleteCustomer, getAllCustomers, getCustomerById, updateCustomer } from "../controllers/customerController";

const router = express.Router();

// GET /customers
router.get("/", getAllCustomers);

// POST /customers
router.post("/", createCustomer);

// GET /customers/:id
router.get("/:id", getCustomerById);

// PUT /customers/:id
router.put("/:id", updateCustomer);

// DELETE /customers/:id
router.delete("/:id", deleteCustomer);

export default router;