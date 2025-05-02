const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskDashboard,
  updateTaskStatus,
  assignTask,
  getTaskAnalytics,
  bulkCreateTasks,
  bulkUpdateTasks,
  exportTasks,
} = require("../controllers/taskController");
const {
  protect,
  authorize,
  checkPermission,
  logUserAction,
  checkOwnership,
} = require("../middleware/authMiddleware");
const Task = require("../models/Task");

const router = express.Router();

// Public routes - none for tasks

// Protected routes - require authentication
router.use(protect);

// GET /api/tasks - Get all tasks (filtered for regular users, all for admins/managers)
router.get("/", getTasks);

// POST /api/tasks - Create a new task (all authenticated users)
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional(),
    body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be low, medium, or high"),
    body("status")
      .optional()
      .isIn(["to-do", "in-progress", "completed", "archived"])
      .withMessage("Status must be to-do, in-progress, completed, or archived"),
    body("assignedTo").optional(),
    body("isRecurring")
      .optional()
      .isBoolean()
      .withMessage("isRecurring must be a boolean"),
    body("recurrencePattern")
      .optional()
      .isIn(["daily", "weekly", "monthly", "none"])
      .withMessage(
        "Recurrence pattern must be daily, weekly, monthly, or none"
      ),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  logUserAction("task-create", "task"),
  createTask
);

// GET /api/tasks/dashboard - Get task dashboard data
router.get("/dashboard", getTaskDashboard);

// GET /api/tasks/:id - Get a single task by ID (with ownership check for users)
router.get("/:id", checkOwnership(Task), getTaskById);

// PUT /api/tasks/:id - Update a task (with ownership check for users)
router.put(
  "/:id",
  checkOwnership(Task),
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional(),
    body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be low, medium, or high"),
    body("status")
      .optional()
      .isIn(["to-do", "in-progress", "completed", "archived"])
      .withMessage("Status must be to-do, in-progress, completed, or archived"),
    body("assignedTo").optional(),
    body("isRecurring")
      .optional()
      .isBoolean()
      .withMessage("isRecurring must be a boolean"),
    body("recurrencePattern")
      .optional()
      .isIn(["daily", "weekly", "monthly", "none"])
      .withMessage(
        "Recurrence pattern must be daily, weekly, monthly, or none"
      ),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  logUserAction("task-update", "task"),
  updateTask
);

// DELETE /api/tasks/:id - Delete a task (with ownership check for users, admin can delete any)
router.delete(
  "/:id",
  checkOwnership(Task),
  logUserAction("task-delete", "task"),
  deleteTask
);

// PATCH /api/tasks/:id/status - Update task status (with ownership check)
router.patch("/:id/status", checkOwnership(Task), updateTaskStatus);

// PATCH /api/tasks/:id/assign - Assign task to user (managers and admins only)
router.patch("/:id/assign", authorize("admin", "manager"), assignTask);

// GET /api/tasks/stats/analytics - Get task analytics (managers and admins only)
router.get("/stats/analytics", authorize("admin", "manager"), getTaskAnalytics);

// POST /api/tasks/bulk-create - Create multiple tasks (managers and admins only)
router.post("/bulk-create", authorize("admin", "manager"), bulkCreateTasks);

// POST /api/tasks/bulk-update - Update multiple tasks (managers and admins only)
router.post("/bulk-update", authorize("admin", "manager"), bulkUpdateTasks);

// GET /api/tasks/export - Export tasks (managers and admins only)
router.get("/export", authorize("admin", "manager"), exportTasks);

module.exports = router;
