
const Tip = require("../models/Tip");
const Activity = require("../models/Activity");

// 1. Add a new tip (Admin only)
exports.createTip = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    const tip = await Tip.create({
      title,
      description,
      category: category || "General"
    });

    res.status(201).json({
      message: "Eco tip added successfully",
      tip
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get personalized tips based on user's activities
exports.getTips = async (req, res, next) => {
  try {
    // Admin can view all tips
    if (req.user.role === "admin") {
      const tips = await Tip.find().sort({ createdAt: -1 });

      return res.status(200).json({
        count: tips.length,
        tips
      });
    }

    // Find user's emissions category totals
    const categoryEmissions = await Activity.aggregate([
      {
        $match: {
          user: req.user._id
        }
      },
      {
        $group: {
          _id: "$category",
          totalEmission: { $sum: "$co2Emission" }
        }
      },
      {
        $sort: {
          totalEmission: -1
        }
      }
    ]);

    // If user has no activities, show general tips
    if (categoryEmissions.length === 0) {
      const tips = await Tip.find({ category: "General" })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Add activities to receive personalized tips.",
        highestEmissionCategory: null,
        count: tips.length,
        tips
      });
    }

    const highestCategory = categoryEmissions[0]._id;
    const highestEmission = categoryEmissions[0].totalEmission;

    // Get tips for the user's highest emission category
    let tips = await Tip.find({
      category: highestCategory
    }).sort({ createdAt: -1 });

    // If no category-specific tips exist, show general tips
    if (tips.length === 0) {
      tips = await Tip.find({ category: "General" })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      message: "Personalized tips fetched successfully",
      highestEmissionCategory: highestCategory,
      highestEmission,
      count: tips.length,
      tips
    });
  } catch (error) {
    next(error);
  }
};

// 3. Update a tip (Admin only)
exports.updateTip = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      { title, description, category },
      { new: true, runValidators: true }
    );

    if (!tip) {
      return res.status(404).json({
        message: "Tip not found"
      });
    }

    res.status(200).json({
      message: "Tip updated successfully",
      tip
    });
  } catch (error) {
    next(error);
  }
};

// 4. Delete a tip (Admin only)
exports.deleteTip = async (req, res, next) => {
  try {
    const tip = await Tip.findByIdAndDelete(req.params.id);

    if (!tip) {
      return res.status(404).json({
        message: "Tip not found"
      });
    }

    res.status(200).json({
      message: "Tip deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
