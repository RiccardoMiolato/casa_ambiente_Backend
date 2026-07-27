// src/routes/users.ts
import express from "express";
import { createCustomer, deleteCustomer, getAllCustomers, getCustomerById, updateCustomer } from "../controllers/customerController";
import { getEstimatesByCustomerId } from "../controllers/estimateController";

const router = express.Router();

// GET /customers
router.get("/", getAllCustomers);

// GET /customers/:id
router.get("/:id", getCustomerById);

// GET /customers/:id/estimates
router.get("/:customerId/estimates", getEstimatesByCustomerId);

// POST /customers
router.post("/", createCustomer);

// PUT /customers/:id
router.put("/:id", updateCustomer);

// DELETE /customers/:id
router.delete("/:id", deleteCustomer);

export default router;