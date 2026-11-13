
const User = require("../models/User");
const Activity = require("../models/Activity");

// =====================================
// GET TOP 10 USERS ON LEADERBOARD
// =====================================

exports.getLeaderboard = async (req, res, next) => {
  try {
    // Get top 10 users
    const users = await User.find({ role: "user" })
      .select("name points greenScore totalActivities totalEmission")
      .sort({
        points: -1,
        greenScore: -1,
        createdAt: 1
      })
      .limit(10)
      .lean();

    // Calculate activity counts for all selected users in one query
    const userIds = users.map((user) => user._id);

    const activityStats = await Activity.aggregate([
      {
        $match: {
          user: { $in: userIds }
        }
      },
      {
        $group: {
          _id: "$user",
          totalActivities: { $sum: 1 },
          totalEmission: { $sum: "$co2Emission" }
        }
      }
    ]);

    // Convert aggregation results into a lookup map
    const statsMap = new Map(
      activityStats.map((item) => [
        item._id.toString(),
        item
      ])
    );

    // Build leaderboard
    const leaderboard = users.map((user, index) => {
      const stats = statsMap.get(user._id.toString());

      return {
        _id: user._id,
        rank: index + 1,
        name: user.name,
        points: Number(user.points) || 0,
        greenScore: Number(user.greenScore) || 0,
        totalActivities:
          stats?.totalActivities ?? user.totalActivities ?? 0,
        totalEmission:
          Number(stats?.totalEmission ?? user.totalEmission) || 0
      };
    });

    // Find logged-in user's position
    let currentUserRank = null;

    if (req.user?._id) {
      const currentUser = await User.findOne({
        _id: req.user._id,
        role: "user"
      }).select("points greenScore");

      if (currentUser) {
        const usersAhead = await User.countDocuments({
          role: "user",
          $or: [
            {
              points: { $gt: currentUser.points }
            },
            {
              points: currentUser.points,
              greenScore: { $gt: currentUser.greenScore }
            }
          ]
        });

        currentUserRank = usersAhead + 1;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully",
      totalUsers: await User.countDocuments({ role: "user" }),
      currentUserRank,
      leaderboard
    });

  } catch (error) {
    next(error);
  }
};
