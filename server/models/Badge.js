
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      default: "🌱"
    },

    requiredPoints: {
      type: Number,
      default: 100,
      min: 0
    },

    requiredActivities: {
      type: Number,
      default: 0,
      min: 0
    },

    requiredChallenges: {
      type: Number,
      default: 0,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Badge", badgeSchema);
