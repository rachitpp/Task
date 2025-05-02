const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

/**
 * Generate the next due date based on recurrence pattern
 * @param {Date} currentDueDate - The current due date
 * @param {string} pattern - The recurrence pattern (daily, weekly, monthly)
 * @returns {Date} The next due date
 */
const getNextDueDate = (currentDueDate, pattern) => {
  const nextDueDate = new Date(currentDueDate);

  switch (pattern) {
    case "daily":
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case "weekly":
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case "monthly":
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    default:
      return null;
  }

  return nextDueDate;
};

/**
 * Create a new instance of a recurring task
 * @param {Object} task - The original recurring task
 * @returns {Promise<void>}
 */
const createRecurringTaskInstance = async (task) => {
  try {
    if (!task.isRecurring || task.recurrencePattern === "none") {
      return;
    }

    // Calculate next due date
    const nextDueDate = getNextDueDate(task.dueDate, task.recurrencePattern);
    if (!nextDueDate) {
      return;
    }

    // Create new task based on the original one
    const newTask = await Task.create({
      title: task.title,
      description: task.description,
      dueDate: nextDueDate,
      priority: task.priority,
      status: "to-do", // Always starts as to-do
      assignedTo: task.assignedTo,
      creator: task.creator,
      isRecurring: true,
      recurrencePattern: task.recurrencePattern,
      tags: task.tags,
    });

    // Log the creation in audit log
    await AuditLog.create({
      user: task.creator,
      action: "task-recurring-create",
      entity: "task",
      entityId: newTask._id,
      details: {
        originalTaskId: task._id,
        recurrencePattern: task.recurrencePattern,
      },
      ipAddress: "system",
      userAgent: "Task Scheduler",
    });

    // Create notification for the assignee if any
    if (newTask.assignedTo) {
      await Notification.create({
        recipient: newTask.assignedTo,
        sender: newTask.creator,
        type: "task-recurring",
        title: "New Recurring Task",
        message: `A new recurring task "${newTask.title}" has been created and assigned to you`,
        task: newTask._id,
      });
    }

    return newTask;
  } catch (error) {
    console.error("Error creating recurring task instance:", error);
  }
};

/**
 * Process completed recurring tasks and create new instances
 */
const processCompletedRecurringTasks = async () => {
  try {
    console.log("Processing completed recurring tasks...");

    // Find all completed recurring tasks
    const completedRecurringTasks = await Task.find({
      status: "completed",
      isRecurring: true,
      recurrencePattern: { $ne: "none" },
    });

    console.log(
      `Found ${completedRecurringTasks.length} completed recurring tasks`
    );

    // Create new instances for each completed recurring task
    for (const task of completedRecurringTasks) {
      await createRecurringTaskInstance(task);
    }
  } catch (error) {
    console.error("Error processing recurring tasks:", error);
  }
};

/**
 * Check for overdue tasks and send notifications
 */
const processOverdueTasks = async () => {
  try {
    console.log("Processing overdue tasks...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find tasks that are overdue and not completed
    const overdueTasks = await Task.find({
      dueDate: { $lt: today },
      status: { $ne: "completed" },
    });

    console.log(`Found ${overdueTasks.length} overdue tasks`);

    // Send notification for each overdue task
    for (const task of overdueTasks) {
      // Send notification to assignee if assigned
      if (task.assignedTo) {
        await Notification.create({
          recipient: task.assignedTo,
          sender: task.creator,
          type: "task-overdue",
          title: "Task Overdue",
          message: `The task "${task.title}" is overdue`,
          task: task._id,
        });
      }

      // Send notification to creator as well
      await Notification.create({
        recipient: task.creator,
        type: "task-overdue",
        title: "Task Overdue",
        message: `Your task "${task.title}" is overdue`,
        task: task._id,
      });
    }
  } catch (error) {
    console.error("Error processing overdue tasks:", error);
  }
};

/**
 * Initialize the task scheduler
 */
const initTaskScheduler = () => {
  // Run daily at midnight to process completed recurring tasks
  cron.schedule("0 0 * * *", processCompletedRecurringTasks);

  // Run daily at 8 AM to check for overdue tasks
  cron.schedule("0 8 * * *", processOverdueTasks);

  console.log("Task scheduler initialized");
};

module.exports = {
  initTaskScheduler,
  processCompletedRecurringTasks,
  processOverdueTasks,
  createRecurringTaskInstance,
  getNextDueDate,
};
