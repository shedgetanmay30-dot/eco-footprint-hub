
const User = require("../models/User");
const Activity = require("../models/Activity");
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");

// =====================================
// ADVANCED ADMIN ANALYTICS
// =====================================

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. Total registered users (excluding admins)
    const totalUsers = await User.countDocuments({
      role: "user"
    });

    // 2. Active users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.countDocuments({
      role: "user",
      lastActivityAt: {
        $gte: thirtyDaysAgo
      }
    });

    // 3. Total activities recorded
    const totalActivities = await Activity.countDocuments();

    // 4. Total carbon emissions
    const emissionResult = await Activity.aggregate([
      {
        $group: {
          _id: null,
          totalEmission: {
            $sum: "$co2Emission"
          }
        }
      }
    ]);

    const totalEmission =
      emissionResult.length > 0
        ? Number(emissionResult[0].totalEmission.toFixed(2))
        : 0;

    // 5. Most popular challenges
    // Count how many users joined each challenge
    const popularChallenges = await UserChallenge.aggregate([
      {
        $group: {
          _id: "$challenge",
          participants: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          participants: -1
        }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "challenges",
          localField: "_id",
          foreignField: "_id",
          as: "challengeDetails"
        }
      },
      {
        $unwind: "$challengeDetails"
      },
      {
        $project: {
          _id: 1,
          title: "$challengeDetails.title",
          participants: 1
        }
      }
    ]);

    // 6. Total challenges
    const totalChallenges = await Challenge.countDocuments();

    // Send analytics response
    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalActivities,
        totalEmission,
        totalChallenges,
        popularChallenges
      }
    });

  } catch (error) {
    console.error("Admin Analytics Error:", error);

    next(error);
  }
};
