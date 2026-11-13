
const mongoose = require("mongoose");
const User = require("../models/User");
const Activity = require("../models/Activity");

// =====================================
// GET LOGGED-IN USER PROFILE
// =====================================

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// UPDATE USER PROFILE
// =====================================

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // UPDATE NAME
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty"
        });
      }

      if (name.trim().length < 2 || name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must contain 2 to 50 characters"
        });
      }

      user.name = name.trim();
    }

    // UPDATE EMAIL
    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty"
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address"
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        greenScore: user.greenScore,
        totalActivities: user.totalActivities,
        totalEmission: user.totalEmission,
        lastActivityAt: user.lastActivityAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// GET USER DASHBOARD STATISTICS
// =====================================

exports.getUserStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const activityStats = await Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId.toString())
        }
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          totalEmission: { $sum: "$co2Emission" }
        }
      }
    ]);

    const stats = activityStats[0] || {
      totalActivities: 0,
      totalEmission: 0
    };

    res.status(200).json({
      success: true,
      statistics: {
        name: user.name,
        points: user.points,
        greenScore: user.greenScore,
        totalActivities: stats.totalActivities,
        totalEmission: Number(stats.totalEmission.toFixed(3)),
        lastActivityAt: user.lastActivityAt,
        accountCreated: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// ADMIN: GET ALL USERS
// =====================================

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// ADMIN: GET SINGLE USER
// =====================================

exports.getSingleUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// ADMIN: DELETE USER
// =====================================

exports.deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete their own account"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};
