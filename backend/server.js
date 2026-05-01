import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// 🔥 CORS FIX (FINAL)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 🔥 Handle preflight requests (IMPORTANT)
app.options("*", cors());

// middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// PORT (Railway compatible)
const PORT = process.env.PORT || 5000;

// DB + server start
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env ❌");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected ✅");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (err) {
    console.error("Server failed ❌:", err.message);
    process.exit(1);
  }
};

startServer();
