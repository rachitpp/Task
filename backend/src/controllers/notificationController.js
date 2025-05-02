const Notification = require("../models/Notification");

/**
 * Get user notifications
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, read } = req.query;

    // Build query
    const query = { recipient: req.user._id };

    // Filter by read status if provided
    if (read !== undefined) {
      query.isRead = read === "true";
    }

    // Count total documents for pagination
    const totalNotifications = await Notification.countDocuments(query);

    // Setup pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch notifications
    const notifications = await Notification.find(query)
      .populate("sender", "name email")
      .populate("task", "title description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: notifications.length,
      total: totalNotifications,
      totalPages: Math.ceil(totalNotifications / parseInt(limit)),
      currentPage: parseInt(page),
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this notification",
      });
    }

    // Mark as read
    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification",
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get unread notifications count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
};
