
const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    points: {
      type: Number,
      default: 10,
      min: 0
    },

    duration: {
      type: Number,
      default: 7,
      min: 1
    },

    category: {
      type: String,
      enum: [
        "transport",
        "electricity",
        "water",
        "food",
        "waste",
        "General"
      ],
      default: "General"
    },

    activityType: {
      type: String,
      default: "",
      trim: true
    },

    targetQuantity: {
      type: Number,
      default: 1,
      min: 0.01
    },

    unit: {
      type: String,
      default: "unit",
      trim: true
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

module.exports = mongoose.model("Challenge", challengeSchema);
