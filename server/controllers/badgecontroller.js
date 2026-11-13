
const Badge = require("../models/Badge");
const User = require("../models/User");
const UserBadge = require("../models/UserBadge");
const Activity = require("../models/Activity");
const UserChallenge = require("../models/UserChallenge");

// =====================================
// AUTOMATIC BADGE AWARDING
// =====================================

exports.checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return [];
    }

    const [
      badges,
      totalActivities,
      completedChallenges,
      earnedRecords
    ] = await Promise.all([
      Badge.find({ isActive: true }),
      Activity.countDocuments({ user: userId }),
      UserChallenge.countDocuments({
        user: userId,
        status: "completed"
      }),
      UserBadge.find({ user: userId }).select("badge")
    ]);

    const earnedIds = new Set(
      earnedRecords.map(record => record.badge.toString())
    );

    const newlyEarned = [];

    for (const badge of badges) {
      if (earnedIds.has(badge._id.toString())) {
        continue;
      }

      const pointsEligible =
        user.points >= (badge.requiredPoints || 0);

      const activitiesEligible =
        totalActivities >= (badge.requiredActivities || 0);

      const challengesEligible =
        completedChallenges >= (badge.requiredChallenges || 0);

      if (
        !pointsEligible ||
        !activitiesEligible ||
        !challengesEligible
      ) {
        continue;
      }

      try {
        const earned = await UserBadge.create({
          user: userId,
          badge: badge._id,
          notificationSeen: false
        });

        newlyEarned.push({
          ...badge.toObject(),
          earnedAt: earned.earnedAt
        });

      } catch (error) {
        // Prevent duplicate badge awards during simultaneous requests.
        if (error.code !== 11000) {
          throw error;
        }
      }
    }

    return newlyEarned;

  } catch (error) {
    console.error("Badge awarding error:", error);
    throw error;
  }
};


// =====================================
// ADMIN: CREATE BADGE
// =====================================

exports.createBadge = async (req, res, next) => {
  try {
    const {
      name,
      description,
      icon,
      requiredPoints,
      requiredActivities,
      requiredChallenges
    } = req.body;

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim() ||
      !description ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Badge name and description are required"
      });
    }

    const points = Number(requiredPoints ?? 100);
    const activities = Number(requiredActivities ?? 0);
    const challenges = Number(requiredChallenges ?? 0);

    if (
      !Number.isFinite(points) ||
      points < 0 ||
      !Number.isInteger(activities) ||
      activities < 0 ||
      !Number.isInteger(challenges) ||
      challenges < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Badge requirements must be valid non-negative numbers"
      });
    }

    const badge = await Badge.create({
      name: name.trim(),
      description: description.trim(),
      icon: icon || "🌱",
      requiredPoints: points,
      requiredActivities: activities,
      requiredChallenges: challenges,
      isActive: true
    });

    // Check existing users who may already qualify for this new badge.
    const users = await User.find({ role: "user" }).select("_id");

    for (const user of users) {
      try {
        await exports.checkAndAwardBadges(user._id);
      } catch (error) {
        console.error(
          `Badge check failed for user ${user._id}:`,
          error.message
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Badge created successfully",
      badge
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A badge with this name already exists"
      });
    }

    next(error);
  }
};


// =====================================
// USER: GET MY BADGES
// =====================================

exports.getMyBadges = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Recheck eligibility whenever the badges page opens.
    const newlyAwarded = await exports.checkAndAwardBadges(userId);

    // Get unread badge notifications.
    const pendingNotifications = await UserBadge.find({
      user: userId,
      notificationSeen: false
    }).populate("badge");

    const newlyEarnedBadges = pendingNotifications
      .filter(record => record.badge)
      .map(record => ({
        ...record.badge.toObject(),
        earnedAt: record.earnedAt
      }));

    // Mark notifications as seen after retrieving them.
    await UserBadge.updateMany(
      {
        user: userId,
        notificationSeen: false
      },
      {
        $set: {
          notificationSeen: true
        }
      }
    );

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [
      badges,
      earnedRecords,
      totalActivities,
      completedChallenges
    ] = await Promise.all([
      Badge.find({ isActive: true }).sort({
        requiredPoints: 1
      }),
      UserBadge.find({ user: userId }).populate("badge"),
      Activity.countDocuments({ user: userId }),
      UserChallenge.countDocuments({
        user: userId,
        status: "completed"
      })
    ]);

    const earnedMap = new Map();

    earnedRecords.forEach(record => {
      if (record.badge) {
        earnedMap.set(
          record.badge._id.toString(),
          record
        );
      }
    });

    const earnedBadges = [];
    const lockedBadges = [];

    badges.forEach(badge => {
      const earnedRecord = earnedMap.get(
        badge._id.toString()
      );

      const requiredPoints = badge.requiredPoints || 0;
      const requiredActivities = badge.requiredActivities || 0;
      const requiredChallenges = badge.requiredChallenges || 0;

      const badgeData = {
        ...badge.toObject(),

        earned: Boolean(earnedRecord),

        earnedAt: earnedRecord
          ? earnedRecord.earnedAt
          : null,

        progress: {
          points: user.points || 0,
          requiredPoints,

          activities: totalActivities,
          requiredActivities,

          challenges: completedChallenges,
          requiredChallenges,

          pointsPercentage: requiredPoints
            ? Math.min(
                100,
                Math.round(
                  ((user.points || 0) / requiredPoints) * 100
                )
              )
            : 100,

          activitiesPercentage: requiredActivities
            ? Math.min(
                100,
                Math.round(
                  (totalActivities / requiredActivities) * 100
                )
              )
            : 100,

          challengesPercentage: requiredChallenges
            ? Math.min(
                100,
                Math.round(
                  (completedChallenges / requiredChallenges) * 100
                )
              )
            : 100
        }
      };

      if (earnedRecord) {
        earnedBadges.push(badgeData);
      } else {
        lockedBadges.push(badgeData);
      }
    });

    const totalBadges = badges.length;
    const earnedCount = earnedBadges.length;

    return res.status(200).json({
      success: true,

      points: user.points || 0,
      totalActivities,
      completedChallenges,

      totalBadges,
      earnedCount,
      lockedCount: lockedBadges.length,

      collectionPercentage: totalBadges
        ? Math.round((earnedCount / totalBadges) * 100)
        : 0,

      newlyEarnedBadges,
      earnedBadges,
      lockedBadges
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// ADMIN: GET ALL BADGES
// =====================================

exports.getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({
      requiredPoints: 1
    });

    return res.status(200).json({
      success: true,
      count: badges.length,
      badges
    });

  } catch (error) {
    next(error);
  }
};


// =====================================
// ADMIN: DELETE BADGE
// =====================================

exports.deleteBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findByIdAndDelete(
      req.params.id
    );

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge not found"
      });
    }

    // Delete all earned records linked to this badge.
    await UserBadge.deleteMany({
      badge: badge._id
    });

    return res.status(200).json({
      success: true,
      message: "Badge and its earned records deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};
