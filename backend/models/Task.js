import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },

    // 🔥 PRIORITY (NEW - useful for dashboard)
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // 👤 Assigned user
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👑 Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📁 Project support (future ready)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    // ⏰ Deadline
    dueDate: {
      type: Date,
    },

    // 🔥 AUTO FLAG (virtual use)
    isOverdue: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 INDEX (fast queries)
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

// 🔥 PRE SAVE: overdue check
taskSchema.pre("save", function (next) {
  if (this.dueDate && this.status !== "done") {
    this.isOverdue = new Date(this.dueDate) < new Date();
  } else {
    this.isOverdue = false;
  }
  next();
});

export default mongoose.model("Task", taskSchema);
