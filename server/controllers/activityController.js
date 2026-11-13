
const Activity = require("../models/Activity");
const User = require("../models/User");
const calculateFootprint = require("../utils/calculateFootprint");

const {
  updateChallengeProgress
} = require("./challengeController");

const {
  checkAndAwardBadges
} = require("./badgecontroller");

// =====================================
// RECALCULATE USER STATISTICS
// =====================================

const updateUserStats = async (userId) => {
  const result = await Activity.aggregate([
    {
      $match: {
        user: userId
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

  const totalActivities = result.length
    ? result[0].totalActivities
    : 0;

  const totalEmission = result.length
    ? Number(result[0].totalEmission.toFixed(4))
    : 0;

  const greenScore = Math.max(
    0,
    Math.round((100 - totalEmission) * 100) / 100
  );

  const latestActivity = await Activity.findOne({
    user: userId
  }).sort({ date: -1 });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        totalActivities,
        totalEmission,
        greenScore,
        lastActivityAt: latestActivity
          ? latestActivity.date
          : null
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  return {
    totalActivities,
    totalEmission,
    greenScore,
    lastActivityAt: latestActivity
      ? latestActivity.date
      : null
  };
};

// =====================================
// ADD NEW ACTIVITY
// =====================================

exports.addActivity = async (req, res, next) => {
  try {
    const {
      category,
      type,
      description,
      quantity,
      unit
    } = req.body;

    if (
      !category ||
      !type ||
      quantity === undefined ||
      quantity === null ||
      quantity === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Category, type and quantity are required"
      });
    }

    const validCategories = [
      "transport",
      "electricity",
      "water",
      "food",
      "waste"
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity category"
      });
    }

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative number"
      });
    }

    const emission = Number(
      calculateFootprint(category, type, amount)
    );

    if (!Number.isFinite(emission) || emission < 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate carbon emission. Check emission factors."
      });
    }

    const activity = await Activity.create({
      user: req.user._id,
      category,
      type,
      description: description || type,
      quantity: amount,
      unit: unit || "unit",
      co2Emission: emission
    });

    // Update user statistics
    const statistics = await updateUserStats(req.user._id);

    // Automatically update challenge progress
    try {
      await updateChallengeProgress(
        req.user._id,
        activity
      );
    } catch (challengeError) {
      console.error(
        "Challenge progress update failed:",
        challengeError.message
      );
    }

    // Automatically award eligible badges
    let newlyEarnedBadges = [];

    try {
      const awardedBadges = await checkAndAwardBadges(
        req.user._id
      );

      newlyEarnedBadges = Array.isArray(awardedBadges)
        ? awardedBadges
        : [];

    } catch (badgeError) {
      console.error(
        "Badge awarding failed:",
        badgeError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Activity added successfully",
      activity,
      statistics,
      newlyEarnedBadges,
      messageForBadges: newlyEarnedBadges.length > 0
        ? "Congratulations! You earned a new badge."
        : "Keep completing activities to earn badges."
    });

  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL USER ACTIVITIES
// =====================================

exports.getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({
      user: req.user._id
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });

  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE USER ACTIVITY
// =====================================

exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    const statistics = await updateUserStats(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      statistics
    });

  } catch (error) {
    next(error);
  }
};

// =====================================
// GET TOTAL CARBON EMISSIONS
// =====================================

exports.getActivityEmission = async (req, res, next) => {
  try {
    const result = await Activity.aggregate([
      {
        $match: {
          user: req.user._id
        }
      },
      {
        $group: {
          _id: null,
          totalEmission: {
            $sum: "$co2Emission"
          }
        }
      }
    ]);

    const totalEmission = result.length
      ? Number(result[0].totalEmission.toFixed(4))
      : 0;

    return res.status(200).json({
      success: true,
      totalEmission
    });

  } catch (error) {
    next(error);
  }
};

// =====================================
// GET USER ACTIVITY STATISTICS
// =====================================

exports.getActivityStats = async (req, res, next) => {
  try {
    const statistics = await updateUserStats(req.user._id);

    const categoryStats = await Activity.aggregate([
      {
        $match: {
          user: req.user._id
        }
      },
      {
        $group: {
          _id: "$category",
          totalActivities: { $sum: 1 },
          totalEmission: { $sum: "$co2Emission" }
        }
      },
      {
        $sort: {
          totalEmission: -1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Activity statistics fetched successfully",
      statistics,
      categoryStats
    });

  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT STATISTICS HELPER
// =====================================

exports.updateUserStats = updateUserStats;
