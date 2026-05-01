import express from "express";
import { login, signup } from "../controllers/authController.js";
import { validateAuth } from "../middleware/validate.js";

const router = express.Router();

// 🔐 SIGNUP
router.post("/signup", validateAuth, signup);

// 🔐 LOGIN
router.post("/login", validateAuth, login);

export default router;
