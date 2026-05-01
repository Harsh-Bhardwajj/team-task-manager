import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// 🔒 GET ALL USERS (Admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role") // ✅ no password
      .sort({ createdAt: -1 }); // latest first

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching users",
    });
  }
});

// 🔒 GET SINGLE USER (self or admin)
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role"); // ✅ no password

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // 👤 allow only self OR admin
    if (req.user.role !== "admin" && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching user",
    });
  }
});

export default router;
