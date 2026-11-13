const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI ||
        !process.env.ADMIN_NAME ||
        !process.env.ADMIN_EMAIL ||
        !process.env.ADMIN_PASSWORD) {
      throw new Error("Please provide all admin settings in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.toLowerCase();

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("An account with this admin email already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    await User.create({
      name: process.env.ADMIN_NAME,
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();