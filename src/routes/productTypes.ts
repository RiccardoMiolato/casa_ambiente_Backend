import express from "express";
import { createProductType, deleteProductType, getAllProductTypes, getProductTypeById, updateProductType } from "../controllers/productController";

const router = express.Router();

// GET /products-types
router.get("", getAllProductTypes);

// GET /products-types/:id
router.get("/:id", getProductTypeById);

// POST /products-types
router.post("/", createProductType);

// PUT /products-types/:id
router.put("/:id", updateProductType);

// DELETE /products-types/:id
router.delete("/:id", deleteProductType);

export default router;