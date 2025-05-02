require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

// Connect to MongoDB
connectDB();

// Wait for MongoDB connection to be established
setTimeout(async () => {
  try {
    // Load User model after connection is established
    const User = require("./src/models/User");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "admin@example.com" });

    if (existingUser) {
      console.log("Test user already exists. Updating password...");

      // Update the user with a new password that will be hashed by the pre-save middleware
      existingUser.password = "Admin123";
      await existingUser.save();

      console.log(
        "Password updated successfully for: admin@example.com / Admin123"
      );
    } else {
      // Create a new test user
      const newUser = await User.create({
        name: "Test Admin",
        email: "admin@example.com",
        password: "Admin123",
        role: "admin",
      });

      console.log("Created test user successfully:");
      console.log("Email: admin@example.com");
      console.log("Password: Admin123");
      console.log("Role: admin");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
}, 1000); // Give it a second to connect
