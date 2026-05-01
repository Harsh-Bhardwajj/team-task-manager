import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// user routes
app.use("/api/users", userRoutes);

// routes
app.use("/api/auth", authRoutes);
// task routes
app.use("/api/tasks", taskRoutes);
// test route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// DB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/taskmanager")
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));
