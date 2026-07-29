// src/routes/users.ts
import express from "express";
import { addProductToSection, addSectionToEstimate, createEstimate, deleteEstimate, deleteSectionFromEstimate, getAllEstimates, getEstimateById, getProductsBySectionId, getSectionsByEstimateId, removeProductFromSection, updateEstimate, updateProductQuantityInSection, updateSectionNameInEstimate } from "../controllers/estimateController";


const router = express.Router();

// GET /estimates
router.get("/", getAllEstimates);

// GET /estimates/:id
router.get("/:id", getEstimateById);

// POST /estimates
router.post("/", createEstimate);

// PUT /estimates/:id
router.put("/:id", updateEstimate);

// DELETE /estimates/:id
router.delete("/:id", deleteEstimate);

/**
 * ESTIMATE SECTIONS
 */

// GET /estimates/:estimateId/sections
router.get("/:estimateId/sections", getSectionsByEstimateId);

// POST /estimates/:estimateId/sections
router.post("/:estimateId/sections", addSectionToEstimate);

// PUT /estimates/:estimateId/sections/:sectionId
router.put("/:estimateId/sections/:sectionId", updateSectionNameInEstimate);

// DELETE /estimates/:estimateId/sections/:sectionId
router.delete("/:estimateId/sections/:sectionId", deleteSectionFromEstimate);

/**
 * ESTIMATE SECTION PRODUCTS
 */
// GET /estimates/:estimateId/sections/:sectionId/products
router.get("/:estimateId/sections/:sectionId/products", getProductsBySectionId);

// POST /estimates/:estimateId/sections/:sectionId/products
router.post("/:estimateId/sections/:sectionId/products", addProductToSection);

// PUT /estimates/:estimateId/sections/:sectionId/products/:productId
router.put("/:estimateId/sections/:sectionId/products/:productId", updateProductQuantityInSection);

// DELETE /estimates/:estimateId/sections/:sectionId/products/:productId
router.delete("/:estimateId/sections/:sectionId/products/:productId", removeProductFromSection);

export default router;