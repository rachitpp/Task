const express = require("express");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications for the current user
router.get("/", protect, getNotifications);

// Get unread notifications count
router.get("/unread-count", protect, getUnreadCount);

// Mark all notifications as read
router.patch("/read-all", protect, markAllNotificationsAsRead);

// Mark a notification as read
router.patch("/:id/read", protect, markNotificationAsRead);

// Delete a notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;
