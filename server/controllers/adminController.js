
const User = require("../models/User");
const Activity = require("../models/Activity");
const FootprintRecord = require("../models/FootprintRecord");
const Challenge = require("../models/Challenge");
const Tip = require("../models/Tip");

// 1. Get admin dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalActivities = await Activity.countDocuments();
    const totalChallenges = await Challenge.countDocuments();
    const totalTips = await Tip.countDocuments();

    const emissionResult = await FootprintRecord.aggregate([
      {
        $group: {
          _id: null,
          totalEmission: { $sum: "$totalEmission" }
        }
      }
    ]);

    const totalEmission = emissionResult.length
      ? Number(emissionResult[0].totalEmission.toFixed(4))
      : 0;

    res.status(200).json({
      success: true,
      totalUsers,
      totalActivities,
      totalChallenges,
      totalTips,
      totalEmission
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get all footprint records
exports.getAllFootprintRecords = async (req, res, next) => {
  try {
    const records = await FootprintRecord.find()
      .populate("user", "name email")
      .sort({ recordedAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get emission report by category
exports.getEmissionReport = async (req, res, next) => {
  try {
    const report = await FootprintRecord.aggregate([
      {
        $group: {
          _id: null,
          transport: { $sum: "$transport" },
          electricity: { $sum: "$electricity" },
          water: { $sum: "$water" },
          food: { $sum: "$food" },
          waste: { $sum: "$waste" },
          totalEmission: { $sum: "$totalEmission" }
        }
      }
    ]);

    const result = report.length
      ? report[0]
      : {
          transport: 0,
          electricity: 0,
          water: 0,
          food: 0,
          waste: 0,
          totalEmission: 0
        };

    res.status(200).json({
      success: true,
      report: result
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get all registered users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// 5. Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either user or admin"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const currentAdminId =
      req.user?._id?.toString() || req.user?.id?.toString();

    // Prevent changing your own admin role
    if (user._id.toString() === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }

    // Prevent removing the last admin
    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last admin"
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const currentAdminId =
      req.user?._id?.toString() || req.user?.id?.toString();

    // Prevent deleting your own account
    if (user._id.toString() === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin"
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
