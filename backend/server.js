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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend is running" });
});

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/events", eventRoutes);

// ✅ Serve React frontend static files
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

// ✅ Fallback to index.html for React Router (FIXED: Use regex pattern)
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(frontendBuildPath, "index.html"), (err) => {
      if (err) {
        res.status(500).json({ error: "Could not load index.html" });
      }
    });
  } else {
    next();
  }
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔴 Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
