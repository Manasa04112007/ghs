import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";

const router = express.Router();

// ✅ Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "GHS_Events",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "auto",
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ✅ GET → Fetch All Events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// ✅ POST → Add New Event
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      image: req.file.path,
      public_id: req.file.filename,
    });

    await newEvent.save();
    res.status(201).json({
      message: "✅ Event added successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("❌ Error adding event:", error);
    res.status(500).json({ message: "Failed to add event" });
  }
});

// ✅ PUT → Update Event
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.file) {
      if (event.public_id) {
        await cloudinary.uploader.destroy(event.public_id);
      }
      event.image = req.file.path;
      event.public_id = req.file.filename;
    }

    if (req.body.title) event.title = req.body.title;
    if (req.body.description) event.description = req.body.description;

    await event.save();

    res.status(200).json({
      message: "✅ Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({ message: "❌ Failed to update event" });
  }
});

// ✅ DELETE → Delete Event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.public_id) {
      await cloudinary.uploader.destroy(event.public_id);
    }

    await event.deleteOne();

    res.status(200).json({ message: "🗑 Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;
