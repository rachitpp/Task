require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

// Email to delete
const emailToDelete = "blazzavel868@gmail.com";

// Connect to MongoDB
connectDB();

// Wait for MongoDB connection to be established
setTimeout(async () => {
  try {
    // Load User model after connection is established
    const User = require("./src/models/User");

    // Create case-insensitive regex
    const emailRegex = new RegExp(`^${emailToDelete}$`, "i");

    // Find and delete any user with the email (case-insensitive)
    const result = await User.deleteMany({ email: emailRegex });

    if (result.deletedCount > 0) {
      console.log(
        `Successfully deleted ${result.deletedCount} user(s) with email matching "${emailToDelete}"`
      );
    } else {
      console.log(`No users found with email matching "${emailToDelete}"`);
    }

    // List remaining users
    console.log("\nRemaining users in the database:");
    const allUsers = await User.find({}, "name email role createdAt");
    allUsers.forEach((user) => {
      console.log({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
}, 1000); // Give it a second to connect
