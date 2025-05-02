require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

// Email to check
const emailToCheck = "blazzavel868@gmail.com";

// Connect to MongoDB
connectDB();

// Wait for MongoDB connection to be established
setTimeout(async () => {
  try {
    // Load User model after connection is established
    const User = require("./src/models/User");

    // Check if user exists
    const existingUser = await User.findOne({ email: emailToCheck });

    if (existingUser) {
      console.log(`User with email ${emailToCheck} exists in the database:`);
      console.log({
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      });
    } else {
      console.log(`No user found with email ${emailToCheck}`);
    }

    // List all users in the database
    console.log("\nAll users in the database:");
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
