import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 🔒 CREATE TASK (Admin only)
router.post("/", protect, async (req, res) => {
  try {
    const { title, status, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const task = await Task.create({
      title,
      status: status || "todo",
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error creating task" });
  }
});

// 🔒 GET TASKS
router.get("/", protect, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    } else {
      tasks = await Task.find({
        assignedTo: req.user.id,
      }).populate("assignedTo", "name email");
    }

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching tasks" });
  }
});

// 🔒 UPDATE TASK
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        ...(req.user.role !== "admin" && {
          assignedTo: req.user.id,
        }),
      },
      req.body,
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error updating task" });
  }
});

// 🔒 DELETE TASK (Admin OR Owner)
router.delete("/:id", protect, async (req, res) => {
  try {
    let task;

    if (req.user.role === "admin") {
      task = await Task.findByIdAndDelete(req.params.id);
    } else {
      // 👤 member can delete only their own task
      task = await Task.findOneAndDelete({
        _id: req.params.id,
        assignedTo: req.user.id,
      });
    }

    if (!task) {
      return res.status(404).json({ msg: "Task not found or not allowed" });
    }

    res.json({
      success: true,
      msg: "Task deleted",
    });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting task" });
  }
});

export default router;
