require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Task = require("./src/models/Task");
const Notification = require("./src/models/Notification");
const AuditLog = require("./src/models/AuditLog");

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    console.log("All users deleted");

    await Task.deleteMany({});
    console.log("All tasks deleted");

    await Notification.deleteMany({});
    console.log("All notifications deleted");

    await AuditLog.deleteMany({});
    console.log("All audit logs deleted");

    console.log("Database cleared successfully");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
}

clearData();
