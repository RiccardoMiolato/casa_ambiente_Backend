import express from "express";
import { createProduct, createProductType, deleteProduct, deleteProductType, getAllProducts, getAllProductTypes, getProductById, getProductTypeById, updateProduct, updateProductType } from "../controllers/productController";

const router = express.Router();

// GET /products
router.get("/", getAllProducts);

// GET /products/:id
router.get("/:id", getProductById);

// POST /products
router.get("/", createProduct);

// PUT /products/:id
router.get("/:id", updateProduct);

// DELETE /products/:id
router.get("/:id", deleteProduct);

/**
 * PRODUCT TYPES
 */

// GET /products/types
router.get("/types/", getAllProductTypes);

// GET /products/types/:id
router.get("/types/:id", getProductTypeById);

// POST /products/types
router.get("/types/", createProductType);

// PUT /products/types/:id
router.get("/types/:id", updateProductType);

// DELETE /products/types/:id
router.get("/types/:id", deleteProductType);

export default router;