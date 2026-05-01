import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 🔒 CREATE TASK
router.post("/", protect, async (req, res) => {
  try {
    const { title, status, assignedTo } = req.body;

    // 1. Validation check
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Title is required",
      });
    }

    // 2. Data Prepare (Safe fallback for IDs)
    // frontend se assignedTo agar khali string ya null aaye toh current user ki id use hogi
    const taskData = {
      title: title.trim(),
      status: status || "todo",
      assignedTo: assignedTo && assignedTo !== "" ? assignedTo : req.user.id,
      createdBy: req.user.id,
    };

    const task = await Task.create(taskData);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err.message); // Railway logs ke liye
    res.status(500).json({
      success: false,
      msg: "Error creating task",
      error: err.message, // Frontend console mein dekhne ke liye
    });
  }
});

// 🔒 GET TASKS
router.get("/", protect, async (req, res) => {
  try {
    let tasks;

    // Admin saare tasks dekh sakta hai
    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      // Members sirf apne assigned tasks dekh sakte hain
      tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    console.error("GET TASKS ERROR:", err.message);
    res.status(500).json({
      success: false,
      msg: "Error fetching tasks",
    });
  }
});

// 🔒 UPDATE TASK (Only Admin or the Assignee can update)
router.put("/:id", protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Agar admin nahi hai, toh check karo ki task usi ko assigned ho
    if (req.user.role !== "admin") {
      query.assignedTo = req.user.id;
    }

    const task = await Task.findOneAndUpdate(query, req.body, { new: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        msg: "Task not found or unauthorized",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error updating task",
    });
  }
});

// 🔒 DELETE TASK (Admin OR Owner/Assignee)
router.delete("/:id", protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Admin delete kar sakta hai, member sirf apna task
    if (req.user.role !== "admin") {
      query.assignedTo = req.user.id;
    }

    const task = await Task.findOneAndDelete(query);

    if (!task) {
      return res.status(404).json({
        success: false,
        msg: "Task not found or not allowed",
      });
    }

    res.json({
      success: true,
      msg: "Task deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting task",
    });
  }
});

export default router;
