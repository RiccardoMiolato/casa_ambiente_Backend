// src/routes/users.ts
import express from "express";
import { addSectionToEstimate, createEstimate, deleteEstimate, deleteSectionFromEstimate, getAllEstimates, getEstimateById, getSectionsByEstimateId, updateEstimate, updateSectionNameInEstimate } from "../controllers/estimateController";


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

// GET /estimates/:id/sections
router.get("/:id/sections", getSectionsByEstimateId);

// POST /estimates/:id/sections
router.post("/:id/sections", addSectionToEstimate);

// PUT /estimates/:estimateId/sections/:sectionId
router.put("/:estimateId/sections/:sectionId", updateSectionNameInEstimate);

// DELETE /estimates/:estimateId/sections/:sectionId
router.delete("/:estimateId/sections/:sectionId", deleteSectionFromEstimate);

export default router;