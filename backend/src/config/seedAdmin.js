const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    // Check if an admin user already exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin user already exists");
      await mongoose.disconnect();
      return;
    }

    // Create admin user using environment variables
    const adminUser = new User({
      name: process.env.ADMIN_NAME || "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "adminPassword123!",
      role: "admin",
    });

    await adminUser.save();

    console.log(`Admin user created with email: ${adminUser.email}`);
    console.log(
      "Please change the default password immediately after first login"
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedAdmin();
