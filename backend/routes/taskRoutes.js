import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// CREATE TASK
router.post("/", protect, async (req, res) => {
  try {
    const { title, status, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, msg: "Title is required" });
    }

    const task = await Task.create({
      title: title.trim(),
      status: status || "todo",
      assignedTo: assignedTo && assignedTo !== "" ? assignedTo : req.user.id,
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err.message);
    return res
      .status(500)
      .json({ success: false, msg: "Error creating task", error: err.message });
  }
});

// GET ALL TASKS
router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { assignedTo: req.user.id };
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: tasks });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching tasks" });
  }
});

// DELETE TASK
router.delete("/:id", protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "admin") query.assignedTo = req.user.id;

    const task = await Task.findOneAndDelete(query);
    if (!task)
      return res.status(404).json({ success: false, msg: "Task not found" });

    return res.json({ success: true, msg: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "Error deleting task" });
  }
});

export default router;
