
const Activity = require("../models/Activity");

// =====================================
// RECOMMENDATION DATABASE
// =====================================

const recommendations = {
  transport: [
    "Use public transport instead of a personal car.",
    "Walk or cycle for short distances.",
    "Try carpooling with friends or colleagues.",
    "Prefer trains or buses for longer journeys."
  ],

  electricity: [
    "Switch off lights and fans when not in use.",
    "Use energy-efficient LED bulbs.",
    "Unplug electronic devices when not required.",
    "Use natural sunlight during the daytime."
  ],

  water: [
    "Close taps when not in use.",
    "Use a bucket instead of a long shower.",
    "Repair leaking taps and pipes.",
    "Reuse water for gardening whenever possible."
  ],

  food: [
    "Include more vegetarian meals in your diet.",
    "Avoid wasting food.",
    "Buy locally produced seasonal food.",
    "Plan meals to reduce food waste."
  ],

  waste: [
    "Separate wet and dry waste.",
    "Reuse and recycle plastic materials.",
    "Avoid single-use plastic products.",
    "Compost organic waste."
  ]
};

// =====================================
// GET PERSONALIZED RECOMMENDATIONS
// =====================================

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate user activities category-wise
    const emissionStats = await Activity.aggregate([
      {
        $match: {
          user: userId
        }
      },
      {
        $group: {
          _id: "$category",
          totalEmission: {
            $sum: "$co2Emission"
          },
          totalActivities: {
            $sum: 1
          }
        }
      }
    ]);

    // Initialize category statistics
    const emissionByCategory = {
      transport: 0,
      electricity: 0,
      water: 0,
      food: 0,
      waste: 0
    };

    const activitiesByCategory = {
      transport: 0,
      electricity: 0,
      water: 0,
      food: 0,
      waste: 0
    };

    // Fill aggregation results
    emissionStats.forEach((item) => {
      if (emissionByCategory[item._id] !== undefined) {
        emissionByCategory[item._id] =
          Number(item.totalEmission) || 0;

        activitiesByCategory[item._id] =
          Number(item.totalActivities) || 0;
      }
    });

    // Calculate total emission and activity count
    const totalEmission = Object.values(emissionByCategory)
      .reduce((sum, value) => sum + value, 0);

    const totalActivities = Object.values(activitiesByCategory)
      .reduce((sum, value) => sum + value, 0);

    // No activity condition
    if (totalActivities === 0) {
      return res.status(200).json({
        success: true,
        message: "Add activities to receive personalized recommendations.",
        totalActivities: 0,
        totalEmission: 0,
        highestEmissionCategory: null,
        categoryEmission: 0,
        emissionByCategory,
        activitiesByCategory,
        recommendations: [],
        categoryRecommendations: []
      });
    }

    // Find highest emission category
    const highestCategory = Object.keys(emissionByCategory)
      .reduce((highest, current) => {
        return emissionByCategory[current] >
          emissionByCategory[highest]
          ? current
          : highest;
      });

    const categoryEmission = emissionByCategory[highestCategory];

    // Generate recommendations for every category
    const categoryRecommendations = Object.keys(recommendations)
      .map((category) => {
        const emission = emissionByCategory[category];

        const percentage = totalEmission > 0
          ? Number(((emission / totalEmission) * 100).toFixed(2))
          : 0;

        let priority = "Low";

        if (category === highestCategory && emission > 0) {
          priority = "High";
        } else if (
          totalEmission > 0 &&
          percentage >= 20
        ) {
          priority = "Medium";
        }

        return {
          category,
          totalEmission: Number(emission.toFixed(2)),
          totalActivities: activitiesByCategory[category],
          percentage,
          priority,
          tips: recommendations[category]
        };
      })
      .sort((a, b) => b.totalEmission - a.totalEmission);

    // Highest category recommendations
    const personalizedRecommendations =
      recommendations[highestCategory];

    return res.status(200).json({
      success: true,
      message: "Personalized recommendations generated successfully",

      totalActivities,
      totalEmission: Number(totalEmission.toFixed(2)),

      highestEmissionCategory: highestCategory,

      categoryEmission: Number(categoryEmission.toFixed(2)),

      emissionPercentage: totalEmission > 0
        ? Number(((categoryEmission / totalEmission) * 100).toFixed(2))
        : 0,

      emissionByCategory,
      activitiesByCategory,

      // Main recommendations for the highest emission category
      recommendations: personalizedRecommendations,

      // Recommendations for every category
      categoryRecommendations
    });

  } catch (error) {
    console.error("Recommendation error:", error);
    next(error);
  }
};
