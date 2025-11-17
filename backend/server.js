import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

const app = express();

// ✅ Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS configuration
app.use(cors());
app.use(express.json());

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend is running" });
});

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/events", eventRoutes);

// ✅ Serve React frontend static files
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ✅ Fallback to index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
