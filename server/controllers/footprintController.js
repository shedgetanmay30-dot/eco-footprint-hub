
const FootprintRecord = require("../models/FootprintRecord");
const calculateFootprint = require("../utils/calculateFootprint");

// CALCULATE AND SAVE FOOTPRINT
exports.calculateAndSaveFootprint = async (req, res, next) => {
  try {
    const { activities } = req.body;

    // Check activities
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one activity"
      });
    }

    // Store category-wise emissions
    const emissions = {
      transport: 0,
      electricity: 0,
      water: 0,
      food: 0,
      waste: 0
    };

    // Calculate emission for every activity
    for (const activity of activities) {
      const { category, type, quantity } = activity;

      if (!category || !type || quantity === undefined ||
          quantity === null || quantity === "") {
        return res.status(400).json({
          message: "Category, type and quantity are required"
        });
      }

      if (!Object.prototype.hasOwnProperty.call(emissions, category)) {
        return res.status(400).json({
          message: "Invalid activity category"
        });
      }

      // Apply the correct emission factor
      const emission = calculateFootprint(
        category,
        type,
        quantity
      );

      emissions[category] += emission;
    }

    // Calculate total carbon footprint
    const totalEmission = Number(
      Object.values(emissions)
        .reduce((sum, value) => sum + value, 0)
        .toFixed(4)
    );

    // Save footprint in MongoDB
    const record = await FootprintRecord.create({
      user: req.user._id,
      ...emissions,
      totalEmission
    });

    res.status(201).json({
      message: "Footprint calculated successfully",
      record
    });

  } catch (error) {
    if (
      error.message.startsWith("Invalid") ||
      error.message.startsWith("Quantity")
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    next(error);
  }
};


// GET USER FOOTPRINT HISTORY
exports.getFootprintHistory = async (req, res, next) => {
  try {
    const records = await FootprintRecord.find({
      user: req.user._id
    }).sort({ recordedAt: -1 });

    res.status(200).json({
      count: records.length,
      records
    });

  } catch (error) {
    next(error);
  }
};


// GET TOTAL FOOTPRINT
exports.getTotalFootprint = async (req, res, next) => {
  try {
    const result = await FootprintRecord.aggregate([
      {
        $match: {
          user: req.user._id
        }
      },
      {
        $group: {
          _id: null,
          totalEmission: {
            $sum: "$totalEmission"
          }
        }
      }
    ]);

    res.status(200).json({
      totalEmission: result.length
        ? Number(result[0].totalEmission.toFixed(4))
        : 0
    });

  } catch (error) {
    next(error);
  }
};
