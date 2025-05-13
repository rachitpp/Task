const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

// Determine optimal bcrypt rounds based on environment
const BCRYPT_ROUNDS = process.env.NODE_ENV === "production" ? 10 : 6;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create a case-insensitive index for email field to improve query performance
userSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 }, // Case-insensitive index
  }
);

// Add index for role to speed up role-based queries
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Use environment-specific salt rounds
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);

    // Update passwordChangedAt field when password changes
    if (this.isModified("password") && !this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // -1s ensures token is created after password change
    }

    next();
  } catch (error) {
    logger.error("Password hashing error", {
      error: error.message,
      userId: this._id,
    });
    next(error);
  }
});

// Method to compare password - optimized with early return for invalid passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    // Quick length check to avoid unnecessary bcrypt comparison
    if (!enteredPassword || enteredPassword.length < 8) {
      return false;
    }

    const isMatch = await bcrypt.compare(enteredPassword, this.password);

    // Update login statistics if password matches
    if (isMatch && this._id) {
      try {
        await mongoose.model("User").findByIdAndUpdate(
          this._id,
          {
            $set: { lastLogin: new Date() },
            $inc: { loginCount: 1 },
          },
          { new: true }
        );
      } catch (err) {
        logger.error("Error updating login stats", { userId: this._id });
      }
    }

    return isMatch;
  } catch (error) {
    logger.error("Password comparison error", {
      error: error.message,
      userId: this._id,
    });
    return false;
  }
};

// Method to check if password was changed after a given timestamp
userSchema.methods.changedPasswordAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return timestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
