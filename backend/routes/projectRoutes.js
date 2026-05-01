import express from "express";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ➕ Create Project
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Project name required" });
    }

    const project = await Project.create({
      name,
      description,
      members: members || [],
      createdBy: req.user.id,
    });

    res.json({ success: true, data: project });
  } catch {
    res.status(500).json({ msg: "Create project error" });
  }
});

// 📄 Get Projects (admin → all, member → own)
router.get("/", protect, async (req, res) => {
  try {
    const projects =
      req.user.role === "admin"
        ? await Project.find().populate("members", "name")
        : await Project.find({
            $or: [{ createdBy: req.user.id }, { members: req.user.id }],
          }).populate("members", "name");

    res.json({ success: true, data: projects });
  } catch {
    res.status(500).json({ msg: "Fetch project error" });
  }
});

export default router;
