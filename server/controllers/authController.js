
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// =====================================
// USER REGISTRATION
// =====================================

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields"
      });
    }

    // Validate name
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 50 characters"
      });
    }

    // Validate email
    if (typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Validate password
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user"
    });

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        greenScore: user.greenScore,
        totalActivities: user.totalActivities || 0,
        totalEmission: user.totalEmission || 0
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    next(error);
  }
};


// =====================================
// USER LOGIN
// =====================================

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid login details"
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user and explicitly retrieve password
    const user = await User.findOne({
      email: normalizedEmail
    }).select("+password");

    // Check whether user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check whether password exists
    if (!user.password) {
      console.error("User password is missing from database");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        greenScore: user.greenScore,
        totalActivities: user.totalActivities || 0,
        totalEmission: user.totalEmission || 0
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};
