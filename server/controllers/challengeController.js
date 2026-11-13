const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");
const User = require("../models/User");

const {
  checkAndAwardBadges
} = require("./badgecontroller");


// ============================================
// HELPER: GET TODAY'S DATE AT UTC MIDNIGHT
// ============================================

const getTodayStart = () => {
  const today = new Date();

  return new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  ));
};


// ============================================
// HELPER: COMPLETE CHALLENGE AND REWARD USER
// ============================================

const completeAndReward = async (
  userChallenge,
  challenge,
  userId
) => {
  // Atomic update ensures a challenge is rewarded only once.
  const completed = await UserChallenge.findOneAndUpdate(
    {
      _id: userChallenge._id,
      user: userId,
      status: "started",
      currentProgress: {
        $gte: userChallenge.targetProgress
      }
    },
    {
      $set: {
        status: "completed",
        currentProgress: userChallenge.targetProgress,
        completedAt: new Date()
      }
    },
    {
      new: true
    }
  );

  if (!completed) {
    return null;
  }

  // Award points exactly once.
  const pointsEarned = Math.max(
    0,
    Number(challenge.points) || 0
  );

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        points: pointsEarned
      }
    },
    {
      new: true
    }
  ).select("-password");

  // Check if challenge points unlock new badges.
  let newBadges = [];

  try {
    newBadges = await checkAndAwardBadges(userId);
  } catch (error) {
    console.error(
      "Badge awarding after challenge completion failed:",
      error.message
    );
  }

  return {
    userChallenge: completed,
    pointsEarned,
    totalPoints: user?.points ?? 0,
    newBadges
  };
};


// ============================================
// 1. CREATE CHALLENGE (ADMIN)
// ============================================

exports.createChallenge = async (req, res, next) => {
  try {
    const {
      title,
      description,
      points,
      duration,
      category,
      activityType,
      targetQuantity,
      unit
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    const validCategories = [
      "transport",
      "electricity",
      "water",
      "food",
      "waste",
      "General"
    ];

    const selectedCategory = category || "General";

    if (!validCategories.includes(selectedCategory)) {
      return res.status(400).json({
        message: "Invalid challenge category"
      });
    }

    const target = Number(targetQuantity ?? 1);
    const challengePoints = Number(points ?? 10);
    const challengeDuration = Number(duration ?? 7);

    if (!Number.isFinite(target) || target <= 0) {
      return res.status(400).json({
        message: "Target quantity must be greater than zero"
      });
    }

    if (
      !Number.isFinite(challengePoints) ||
      challengePoints < 0
    ) {
      return res.status(400).json({
        message: "Points must be a valid non-negative number"
      });
    }

    if (
      !Number.isInteger(challengeDuration) ||
      challengeDuration <= 0
    ) {
      return res.status(400).json({
        message: "Duration must be a positive whole number"
      });
    }

    const challenge = await Challenge.create({
      title: title.trim(),
      description: description.trim(),
      points: challengePoints,
      duration: challengeDuration,
      category: selectedCategory,
      activityType: activityType || "",
      targetQuantity: target,
      unit: unit || "unit"
    });

    res.status(201).json({
      success: true,
      message: "Challenge created successfully",
      challenge
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// 2. GET ALL CHALLENGES WITH USER PROGRESS
// ============================================

exports.getChallenges = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { isActive: true };

    const challenges = await Challenge.find(filter)
      .sort({ createdAt: -1 });

    const userProgress = await UserChallenge.find({
      user: req.user._id
    });

    const progressMap = new Map(
      userProgress.map(item => [
        item.challenge.toString(),
        item
      ])
    );

    const result = challenges.map(challenge => {
      const progress = progressMap.get(
        challenge._id.toString()
      );

      const target = challenge.category === "General"
        ? challenge.duration
        : (
            progress?.targetProgress ||
            challenge.targetQuantity ||
            1
          );

      return {
        ...challenge.toObject(),
        joined: Boolean(progress),
        userProgress: progress?.currentProgress || 0,
        userStatus: progress?.status || "not joined",
        targetProgress: target,
        progressDates: progress?.progressDates || []
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      challenges: result
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// 3. UPDATE CHALLENGE (ADMIN)
// ============================================

exports.updateChallenge = async (req, res, next) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "points",
      "duration",
      "category",
      "activityType",
      "targetQuantity",
      "unit",
      "isActive"
    ];

    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.targetQuantity !== undefined &&
      (
        !Number.isFinite(Number(updates.targetQuantity)) ||
        Number(updates.targetQuantity) <= 0
      )
    ) {
      return res.status(400).json({
        message: "Target quantity must be greater than zero"
      });
    }

    if (
      updates.points !== undefined &&
      (
        !Number.isFinite(Number(updates.points)) ||
        Number(updates.points) < 0
      )
    ) {
      return res.status(400).json({
        message: "Points must be a valid non-negative number"
      });
    }

    if (
      updates.duration !== undefined &&
      (
        !Number.isInteger(Number(updates.duration)) ||
        Number(updates.duration) <= 0
      )
    ) {
      return res.status(400).json({
        message: "Duration must be a positive whole number"
      });
    }

    if (updates.category !== undefined) {
      const validCategories = [
        "transport",
        "electricity",
        "water",
        "food",
        "waste",
        "General"
      ];

      if (!validCategories.includes(updates.category)) {
        return res.status(400).json({
          message: "Invalid challenge category"
        });
      }
    }

    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Challenge updated successfully",
      challenge
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// 4. DELETE CHALLENGE (ADMIN)
// ============================================

exports.deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(
      req.params.id
    );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found"
      });
    }

    await UserChallenge.deleteMany({
      challenge: req.params.id
    });

    res.status(200).json({
      success: true,
      message: "Challenge deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// 5. JOIN CHALLENGE
// ============================================

exports.joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge || !challenge.isActive) {
      return res.status(404).json({
        message: "Active challenge not found"
      });
    }

    const alreadyJoined = await UserChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    if (alreadyJoined) {
      return res.status(400).json({
        message: "You have already joined this challenge"
      });
    }

    const target = challenge.category === "General"
      ? challenge.duration
      : (challenge.targetQuantity || 1);

    const userChallenge = await UserChallenge.create({
      user: req.user._id,
      challenge: challenge._id,
      status: "started",
      currentProgress: 0,
      targetProgress: target,
      progressDates: []
    });

    res.status(201).json({
      success: true,
      message: "Challenge joined successfully",
      userChallenge
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already joined this challenge"
      });
    }

    next(error);
  }
};


// ============================================
// 6. GET MY CHALLENGES
// ============================================

exports.getMyChallenges = async (req, res, next) => {
  try {
    const challenges = await UserChallenge.find({
      user: req.user._id
    })
      .populate("challenge")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      challenges
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// 7. DAILY CHECK-IN FOR GENERAL CHALLENGES
// ============================================

exports.checkInChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge || !challenge.isActive) {
      return res.status(404).json({
        message: "Active challenge not found"
      });
    }

    if (challenge.category !== "General") {
      return res.status(400).json({
        message: "This challenge tracks progress through activities. Log a matching activity instead."
      });
    }

    const userChallenge = await UserChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    if (!userChallenge) {
      return res.status(404).json({
        message: "Join this challenge before checking in"
      });
    }

    if (userChallenge.status === "completed") {
      return res.status(400).json({
        message: "This challenge is already completed"
      });
    }

    const today = getTodayStart();
    const target = Number(challenge.duration);

    // Only one check-in per UTC calendar day.
    const updated = await UserChallenge.findOneAndUpdate(
      {
        _id: userChallenge._id,
        user: req.user._id,
        status: "started",
        progressDates: { $ne: today }
      },
      {
        $inc: {
          currentProgress: 1
        },
        $push: {
          progressDates: today
        },
        $set: {
          targetProgress: target
        }
      },
      {
        new: true
      }
    );

    if (!updated) {
      const latest = await UserChallenge.findById(
        userChallenge._id
      );

      if (latest?.status === "completed") {
        return res.status(400).json({
          message: "This challenge is already completed"
        });
      }

      return res.status(400).json({
        message: "You have already checked in today. Come back tomorrow!",
        currentProgress: latest?.currentProgress || 0,
        targetProgress: target
      });
    }

    // Complete and reward when the target is reached.
    if (updated.currentProgress >= target) {
      const reward = await completeAndReward(
        updated,
        challenge,
        req.user._id
      );

      if (reward) {
        return res.status(200).json({
          success: true,
          message: "Congratulations! Challenge completed!",
          ...reward
        });
      }
    }

    const latestProgress = await UserChallenge.findById(
      updated._id
    );

    res.status(200).json({
      success: true,
      message: "Daily check-in successful! Keep going.",
      currentProgress: latestProgress.currentProgress,
      targetProgress: target,
      remainingDays: Math.max(
        0,
        target - latestProgress.currentProgress
      ),
      userChallenge: latestProgress
    });

  } catch (error) {
    next(error);
  }
};


// ============================================
// 8. AUTOMATIC CHALLENGE PROGRESS FROM ACTIVITIES
// ============================================

exports.updateChallengeProgress = async (userId, activity) => {
  try {
    if (
      !activity ||
      !Number.isFinite(Number(activity.quantity)) ||
      Number(activity.quantity) <= 0
    ) {
      return;
    }

    const userChallenges = await UserChallenge.find({
      user: userId,
      status: "started"
    }).populate("challenge");

    for (const userChallenge of userChallenges) {
      const challenge = userChallenge.challenge;

      if (!challenge || !challenge.isActive) {
        continue;
      }

      // General challenges use daily check-ins.
      if (challenge.category === "General") {
        continue;
      }

      // Match activity category.
      if (challenge.category !== activity.category) {
        continue;
      }

      // Match activity type if configured.
      if (
        challenge.activityType &&
        challenge.activityType.toLowerCase() !==
          String(activity.type || "").toLowerCase()
      ) {
        continue;
      }

      // Match activity unit if configured.
      if (
        challenge.unit &&
        challenge.unit !== "unit" &&
        challenge.unit.toLowerCase() !==
          String(activity.unit || "").toLowerCase()
      ) {
        continue;
      }

      const target = Number(
        userChallenge.targetProgress ||
        challenge.targetQuantity ||
        1
      );

      // Increment progress only while the challenge is started.
      const updated = await UserChallenge.findOneAndUpdate(
        {
          _id: userChallenge._id,
          user: userId,
          status: "started"
        },
        {
          $inc: {
            currentProgress: Number(activity.quantity)
          },
          $set: {
            targetProgress: target
          }
        },
        {
          new: true
        }
      );

      if (!updated) {
        continue;
      }

      // Complete challenge and award points once.
      if (updated.currentProgress >= target) {
        await completeAndReward(
          updated,
          challenge,
          userId
        );
      }
    }

  } catch (error) {
    console.error(
      "Challenge progress update error:",
      error
    );

    throw error;
  }
};