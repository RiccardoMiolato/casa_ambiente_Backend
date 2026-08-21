// src/server.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import { requireAuth } from "./middleware/auth";
import authRoutes from "./routes/auth";
import customerRoutes from "./routes/customer";
import customerTypeRoutes from "./routes/customerType";
import estimateRoutes from "./routes/estimates";
import orderRoutes from "./routes/orders";
import producerRoutes from "./routes/producer";
import productRoutes from "./routes/products";
import productTypeRoutes from "./routes/productTypes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============= MIDDLEWARE =============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// ============= ROUTES =============
app.use("/api/auth", authRoutes);
app.use("/api/customers", requireAuth, customerRoutes);
app.use("/api/customer/types", requireAuth, customerTypeRoutes);
app.use("/api/estimates", requireAuth, estimateRoutes);
app.use("/api/producers", requireAuth, producerRoutes);
app.use("/api/products", requireAuth, productRoutes);
app.use("/api/product-types", requireAuth, productTypeRoutes);
app.use("/api/orders", requireAuth, orderRoutes);

// Health check
// Used to verify server status through HTTP requests
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// ============= ERROR HANDLING =============
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;