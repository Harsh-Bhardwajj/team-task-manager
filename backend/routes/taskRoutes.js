import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 🔒 CREATE TASK
router.post("/", protect, async (req, res) => {
  // <--- Yahan se 'next' hata diya hai
  try {
    const { title, status, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Title is required",
      });
    }

    const taskData = {
      title: title.trim(),
      status: status || "todo",
      // Agar assignedTo nahi hai, toh protect middleware se aayi req.user.id use hogi
      assignedTo: assignedTo && assignedTo !== "" ? assignedTo : req.user.id,
      createdBy: req.user.id,
    };

    const task = await Task.create(taskData);

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err.message);
    // Yahan next(err) call mat karna, direct response bhejna
    return res.status(500).json({
      success: false,
      msg: "Error creating task",
      error: err.message,
    });
  }
});

// GET, PUT, DELETE routes mein bhi yahi pattern follow karein (next hata dein)

export default router;
