const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

/**
 * Get all tasks with filtering and pagination
 * @route GET /api/tasks
 * @access Private
 */
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      search,
      dueDate,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by assignee
    if (assignedTo === "me") {
      query.assignedTo = req.user._id;
    } else if (assignedTo === "none") {
      query.assignedTo = { $exists: false };
    } else if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }

    // Filter by creator (my tasks)
    if (req.query.creator === "me") {
      query.creator = req.user._id;
    }

    // Filter by due date
    if (dueDate === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.dueDate = { $gte: today, $lt: tomorrow };
    } else if (dueDate === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.dueDate = { $lt: today };
      query.status = { $ne: "completed" };
    } else if (dueDate === "week") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      query.dueDate = { $gte: today, $lt: nextWeek };
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents for pagination
    const totalTasks = await Task.countDocuments(query);

    // Setup pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort direction
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Fetch tasks
    const tasks = await Task.find(query)
      .populate("creator", "name email")
      .populate("assignedTo", "name email")
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: tasks.length,
      total: totalTasks,
      totalPages: Math.ceil(totalTasks / parseInt(limit)),
      currentPage: parseInt(page),
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get a single task by ID
 * @route GET /api/tasks/:id
 * @access Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("creator", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Create a new task
 * @route POST /api/tasks
 * @access Private
 */
const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      isRecurring,
      recurrencePattern,
      tags,
    } = req.body;

    // Create new task
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      isRecurring,
      recurrencePattern,
      tags,
      creator: req.user._id,
    });

    // Create audit log for task creation
    await AuditLog.create({
      user: req.user._id,
      action: "task-create",
      entity: "task",
      entityId: task._id,
      details: {
        title: task.title,
        assignedTo: task.assignedTo,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // If task is assigned to someone, create a notification
    if (
      task.assignedTo &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await Notification.create({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: "task-assigned",
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${task.title}`,
        task: task._id,
      });

      // Send real-time notification via Socket.io
      const io = req.app.get("io");
      if (io) {
        // Populate the sender information for the notification
        const populatedNotification = await Notification.findById(
          notification._id
        )
          .populate("sender", "name email")
          .populate("task", "title description");

        // Emit to the specific user's room
        io.to(`user:${task.assignedTo.toString()}`).emit("notification", {
          type: "new",
          data: populatedNotification,
        });
      }
    }

    // Return created task
    const createdTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedTo", "name email");

    res.status(201).json({
      success: true,
      data: createdTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update a task
 * @route PUT /api/tasks/:id
 * @access Private
 */
const updateTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Find the task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    const isAdmin = req.user.role === "admin";
    const isManager = req.user.role === "manager";
    const isCreator = task.creator.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isManager && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Store the original assignee for notification purposes
    const originalAssignee = task.assignedTo
      ? task.assignedTo.toString()
      : null;

    // Extract task data from request
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      isRecurring,
      recurrencePattern,
      tags,
    } = req.body;

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (isRecurring !== undefined) task.isRecurring = isRecurring;
    if (recurrencePattern) task.recurrencePattern = recurrencePattern;
    if (tags !== undefined) task.tags = tags;

    // Save the updated task
    await task.save();

    // Create audit log for task update
    await AuditLog.create({
      user: req.user._id,
      action: "task-update",
      entity: "task",
      entityId: task._id,
      details: {
        title: task.title,
        assignedTo: task.assignedTo,
        changes: req.body,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Handle notifications
    const io = req.app.get("io");

    // 1. If task assignee has changed, notify the new assignee
    if (
      task.assignedTo &&
      (!originalAssignee || originalAssignee !== task.assignedTo.toString()) &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await Notification.create({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: "task-assigned",
        title: "New Task Assigned",
        message: `You have been assigned a task: ${task.title}`,
        task: task._id,
      });

      // Send real-time notification via Socket.io
      if (io) {
        // Populate the sender information for the notification
        const populatedNotification = await Notification.findById(
          notification._id
        )
          .populate("sender", "name email")
          .populate("task", "title description");

        // Emit to the specific user's room
        io.to(`user:${task.assignedTo.toString()}`).emit("notification", {
          type: "new",
          data: populatedNotification,
        });
      }
    }

    // 2. If task status has changed, notify relevant parties
    if (req.body.status && task.status !== req.body.status) {
      // Notify creator if assignee changed the status
      if (
        isAssignee &&
        !isCreator &&
        task.creator.toString() !== req.user._id.toString()
      ) {
        const notification = await Notification.create({
          recipient: task.creator,
          sender: req.user._id,
          type: "task-status-change",
          title: "Task Status Changed",
          message: `The status of task "${task.title}" has been changed to ${task.status}`,
          task: task._id,
        });

        // Send real-time notification via Socket.io
        if (io) {
          const populatedNotification = await Notification.findById(
            notification._id
          )
            .populate("sender", "name email")
            .populate("task", "title description");

          io.to(`user:${task.creator.toString()}`).emit("notification", {
            type: "new",
            data: populatedNotification,
          });
        }
      }

      // Notify assignee if creator changed the status
      if (
        isCreator &&
        !isAssignee &&
        task.assignedTo &&
        task.assignedTo.toString() !== req.user._id.toString()
      ) {
        const notification = await Notification.create({
          recipient: task.assignedTo,
          sender: req.user._id,
          type: "task-status-change",
          title: "Task Status Changed",
          message: `The status of task "${task.title}" has been changed to ${task.status}`,
          task: task._id,
        });

        // Send real-time notification via Socket.io
        if (io) {
          const populatedNotification = await Notification.findById(
            notification._id
          )
            .populate("sender", "name email")
            .populate("task", "title description");

          io.to(`user:${task.assignedTo.toString()}`).emit("notification", {
            type: "new",
            data: populatedNotification,
          });
        }
      }
    }

    // Return updated task
    const updatedTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedTo", "name email");

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 * @access Private
 */
const deleteTask = async (req, res) => {
  try {
    // Find the task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is authorized to delete the task
    // (only creator or admin can delete)
    const isCreator = task.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    // Delete task
    await Task.findByIdAndDelete(req.params.id);

    // Create audit log for task deletion
    await AuditLog.create({
      user: req.user._id,
      action: "task-delete",
      entity: "task",
      entityId: task._id,
      details: {
        title: task.title,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // If task was assigned to someone, notify them about deletion
    if (
      task.assignedTo &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      await Notification.create({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: "task-updated",
        title: "Task Deleted",
        message: `The task "${task.title}" has been deleted`,
        task: task._id,
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get task dashboard stats
 * @route GET /api/tasks/dashboard
 * @access Private
 */
const getTaskDashboard = async (req, res) => {
  try {
    // Get tasks assigned to the user
    const assignedTasks = await Task.find({
      assignedTo: req.user._id,
    }).countDocuments();

    // Get tasks created by the user
    const createdTasks = await Task.find({
      creator: req.user._id,
    }).countDocuments();

    // Get overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.find({
      assignedTo: req.user._id,
      dueDate: { $lt: today },
      status: { $ne: "completed" },
    }).countDocuments();

    // Get tasks by status
    const tasksByStatus = await Task.aggregate([
      {
        $match: {
          $or: [{ assignedTo: req.user._id }, { creator: req.user._id }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      {
        $match: {
          $or: [{ assignedTo: req.user._id }, { creator: req.user._id }],
        },
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent tasks
    const recentTasks = await Task.find({
      $or: [{ assignedTo: req.user._id }, { creator: req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("creator", "name email")
      .populate("assignedTo", "name email");

    // Build result object
    const dashboardData = {
      overview: {
        assignedTasks,
        createdTasks,
        overdueTasks,
      },
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentTasks,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update task status
 * @route PATCH /api/tasks/:id/status
 * @access Private
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (
      !status ||
      !["to-do", "in-progress", "completed", "archived"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find the task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Update the task status
    task.status = status;

    // If marking as completed, record the completion date
    if (status === "completed" && task.status !== "completed") {
      // No need to add a completion date field, using updatedAt instead
    }

    await task.save();

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      action: "task-status-update",
      entity: "task",
      entityId: task._id,
      details: {
        previousStatus: task.status,
        newStatus: status,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // If task is assigned to someone else, notify them
    if (
      task.assignedTo &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      await Notification.create({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: "task-status-change",
        title: "Task Status Updated",
        message: `The status of "${task.title}" has been changed to ${status}`,
        task: task._id,
      });

      // Send real-time notification if socket is available
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets");

      if (io && userSockets.has(task.assignedTo.toString())) {
        io.to(`user:${task.assignedTo.toString()}`).emit("notification", {
          type: "task-status-change",
          title: "Task Status Updated",
          message: `The status of "${task.title}" has been changed to ${status}`,
          task: {
            _id: task._id,
            title: task.title,
          },
        });
      }
    }

    res.json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Assign task to user
 * @route PATCH /api/tasks/:id/assign
 * @access Private - Managers and Admins Only
 */
const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // If userId is null or undefined, unassign the task
    if (!userId) {
      task.assignedTo = undefined;
      await task.save();

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        action: "task-unassign",
        entity: "task",
        entityId: task._id,
        details: {
          previousAssignee: task.assignedTo,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.json({
        success: true,
        message: "Task unassigned successfully",
        data: task,
      });
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the task
    const previousAssignee = task.assignedTo;
    task.assignedTo = userId;
    await task.save();

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      action: "task-assign",
      entity: "task",
      entityId: task._id,
      details: {
        previousAssignee,
        newAssignee: userId,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Notify the assignee
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: "task-assigned",
      title: "New Task Assigned",
      message: `You have been assigned to the task "${task.title}"`,
      task: task._id,
    });

    // Send real-time notification if socket is available
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");

    if (io && userSockets.has(userId.toString())) {
      io.to(`user:${userId.toString()}`).emit("notification", {
        type: "task-assigned",
        title: "New Task Assigned",
        message: `You have been assigned to the task "${task.title}"`,
        task: {
          _id: task._id,
          title: task.title,
        },
      });
    }

    res.json({
      success: true,
      message: "Task assigned successfully",
      data: task,
    });
  } catch (error) {
    console.error("Assign task error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task or user not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get task analytics data
 * @route GET /api/tasks/stats/analytics
 * @access Private - Managers and Admins Only
 */
const getTaskAnalytics = async (req, res) => {
  try {
    // Get date range from query params
    const { startDate, endDate } = req.query;

    const matchCriteria = {};

    if (startDate && endDate) {
      matchCriteria.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Tasks created per day
    const tasksCreatedPerDay = await Task.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Tasks completed per day
    const tasksCompletedPerDay = await Task.aggregate([
      {
        $match: {
          status: "completed",
          ...matchCriteria,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Task completion rate by user
    const taskCompletionRateByUser = await Task.aggregate([
      { $match: { assignedTo: { $exists: true } } },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          user: "$_id",
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { completionRate: -1 } },
    ]);

    // Populate user details for completion rate
    const userIds = taskCompletionRateByUser.map((item) => item.user);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "name email"
    );

    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = {
        name: user.name,
        email: user.email,
      };
      return acc;
    }, {});

    const taskCompletionRateWithUserDetails = taskCompletionRateByUser.map(
      (item) => ({
        ...item,
        userDetails: userMap[item.user.toString()] || {
          name: "Unknown",
          email: "unknown",
        },
      })
    );

    // Return the analytics data
    res.json({
      success: true,
      data: {
        tasksCreatedPerDay,
        tasksCompletedPerDay,
        taskCompletionRateByUser: taskCompletionRateWithUserDetails,
      },
    });
  } catch (error) {
    console.error("Task analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Bulk create tasks
 * @route POST /api/tasks/bulk-create
 * @access Private - Managers and Admins Only
 */
const bulkCreateTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tasks data. Expected an array of tasks.",
      });
    }

    // Add creator to all tasks
    const tasksWithCreator = tasks.map((task) => ({
      ...task,
      creator: req.user._id,
    }));

    // Create tasks in bulk
    const createdTasks = await Task.insertMany(tasksWithCreator);

    // Create audit logs for all tasks
    const auditLogs = createdTasks.map((task) => ({
      user: req.user._id,
      action: "task-create",
      entity: "task",
      entityId: task._id,
      details: {
        title: task.title,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }));

    await AuditLog.insertMany(auditLogs);

    // Create notifications for assigned users
    const notifications = [];

    for (const task of createdTasks) {
      if (
        task.assignedTo &&
        task.assignedTo.toString() !== req.user._id.toString()
      ) {
        notifications.push({
          recipient: task.assignedTo,
          sender: req.user._id,
          type: "task-assigned",
          title: "New Task Assigned",
          message: `You have been assigned to the task "${task.title}"`,
          task: task._id,
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Send real-time notifications
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets");

      if (io) {
        // Group notifications by recipient
        const notificationsByRecipient = notifications.reduce(
          (acc, notification) => {
            const recipientId = notification.recipient.toString();
            if (!acc[recipientId]) {
              acc[recipientId] = [];
            }
            acc[recipientId].push({
              type: notification.type,
              title: notification.title,
              message: notification.message,
              task: {
                _id: notification.task,
                title:
                  tasks.find(
                    (t) => t._id.toString() === notification.task.toString()
                  )?.title || "Unknown",
              },
            });
            return acc;
          },
          {}
        );

        // Send notifications to each recipient
        for (const [recipientId, recipientNotifications] of Object.entries(
          notificationsByRecipient
        )) {
          if (userSockets.has(recipientId)) {
            io.to(`user:${recipientId}`).emit(
              "notifications",
              recipientNotifications
            );
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdTasks.length} tasks created successfully`,
      data: createdTasks,
    });
  } catch (error) {
    console.error("Bulk create tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Bulk update tasks
 * @route POST /api/tasks/bulk-update
 * @access Private - Managers and Admins Only
 */
const bulkUpdateTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tasks data. Expected an array of tasks with IDs.",
      });
    }

    // Validate that all tasks have IDs
    const validTasks = tasks.filter(
      (task) => task._id && mongoose.Types.ObjectId.isValid(task._id)
    );

    if (validTasks.length !== tasks.length) {
      return res.status(400).json({
        success: false,
        message: "All tasks must have valid IDs.",
      });
    }

    // Update tasks
    const updatePromises = validTasks.map(async (task) => {
      const { _id, ...updateData } = task;
      return Task.findByIdAndUpdate(_id, updateData, { new: true });
    });

    const updatedTasks = await Promise.all(updatePromises);

    // Create audit logs
    const auditLogs = updatedTasks.map((task) => ({
      user: req.user._id,
      action: "task-update",
      entity: "task",
      entityId: task._id,
      details: {
        title: task.title,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }));

    await AuditLog.insertMany(auditLogs);

    res.json({
      success: true,
      message: `${updatedTasks.length} tasks updated successfully`,
      data: updatedTasks,
    });
  } catch (error) {
    console.error("Bulk update tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Export tasks to CSV
 * @route GET /api/tasks/export
 * @access Private - Managers and Admins Only
 */
const exportTasks = async (req, res) => {
  try {
    // Get all tasks
    const tasks = await Task.find()
      .populate("creator", "name email")
      .populate("assignedTo", "name email");

    // Convert tasks to CSV format
    const csvHeader =
      "ID,Title,Description,Status,Priority,Due Date,Assigned To,Created By,Created At\n";

    const csvRows = tasks
      .map((task) => {
        const dueDate = task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "";
        const assignedTo = task.assignedTo
          ? task.assignedTo.name
          : "Unassigned";
        const createdBy = task.creator ? task.creator.name : "Unknown";
        const createdAt = new Date(task.createdAt).toISOString().split("T")[0];

        // Escape double quotes in text fields
        const escapeField = (field) => {
          if (typeof field !== "string") return field;
          return `"${field.replace(/"/g, '""')}"`;
        };

        return [
          task._id,
          escapeField(task.title),
          escapeField(task.description || ""),
          task.status,
          task.priority,
          dueDate,
          escapeField(assignedTo),
          escapeField(createdBy),
          createdAt,
        ].join(",");
      })
      .join("\n");

    const csv = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tasks.csv");

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      action: "task-export",
      entity: "task",
      details: {
        count: tasks.length,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Send CSV data
    res.send(csv);
  } catch (error) {
    console.error("Export tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
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
};
