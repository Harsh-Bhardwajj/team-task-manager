import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 🔒 CREATE TASK
// Note: 'async' handler mein 'next' define karna safe hota hai agar aap use catch block mein use kar rahe ho
router.post("/", protect, async (req, res, next) => {
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
      // Safety check for req.user existence
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
    // next(err) ki jagah direct response bhej rahe hain taaki 'next' undefined error na de
    return res.status(500).json({
      success: false,
      msg: "Error creating task",
      error: err.message,
    });
  }
});

// 🔒 GET TASKS
router.get("/", protect, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
    }

    return res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    console.error("GET TASKS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Error fetching tasks",
    });
  }
});

// 🔒 UPDATE TASK
router.put("/:id", protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };

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

    return res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error updating task",
    });
  }
});

// 🔒 DELETE TASK
router.delete("/:id", protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };

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

    return res.json({
      success: true,
      msg: "Task deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error deleting task",
    });
  }
});

export default router;
