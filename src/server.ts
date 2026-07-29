// src/server.ts
import cors from "cors";
import dotenv from "dotenv";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import { prisma } from "./lib/prisma";
import customerRoutes from "./routes/customer";
import customerTypeRoutes from "./routes/customerType";
import estimateRoutes from "./routes/estimates";
import producerRoutes from "./routes/producer";
import productRoutes from "./routes/products";
import productTypeRoutes from "./routes/productTypes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============= MIDDLEWARE =============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ============= ROUTES =============
app.use("/api/customers", customerRoutes);
app.use("/api/customer/types", customerTypeRoutes);
app.use("/api/estimates", estimateRoutes);
app.use("/api/producers", producerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-types", productTypeRoutes);

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

// ============= SERVER STARTUP =============
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ============= GRACEFUL SHUTDOWN =============
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;