const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["to-do", "in-progress", "completed", "archived"],
      default: "to-do",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none",
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
taskSchema.index({ title: "text", description: "text" });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ creator: 1 });
taskSchema.index({ assignedTo: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
