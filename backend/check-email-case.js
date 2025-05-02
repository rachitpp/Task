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

    // Create case-insensitive regex
    const emailRegex = new RegExp(`^${emailToCheck}$`, "i");

    // Check for any user with the same email (case-insensitive)
    const existingUsers = await User.find({ email: emailRegex });

    if (existingUsers.length > 0) {
      console.log(
        `Found ${existingUsers.length} user(s) with a case-insensitive match for "${emailToCheck}":`
      );
      existingUsers.forEach((user) => {
        console.log({
          id: user._id,
          name: user.name,
          email: user.email, // This will show the exact case stored in the database
          role: user.role,
          createdAt: user.createdAt,
        });
      });
    } else {
      console.log(
        `No users found with email similar to "${emailToCheck}" (case-insensitive)`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
}, 1000); // Give it a second to connect
