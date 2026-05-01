import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 📊 DASHBOARD STATS
router.get("/", protect, async (req, res) => {
  try {
    let tasks;

    // 👑 admin → all tasks
    if (req.user.role === "admin") {
      tasks = await Task.find();
    } else {
      // 👤 member → only own tasks
      tasks = await Task.find({ assignedTo: req.user.id });
    }

    const total = tasks.length;

    const completed = tasks.filter((t) => t.status === "done").length;

    const pending = tasks.filter((t) => t.status !== "done").length;

    const overdue = tasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
    ).length;

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        overdue,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Dashboard error",
    });
  }
});

export default router;
