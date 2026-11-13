
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  category: {
    type: String,
    enum: ["transport", "electricity", "water", "food", "waste"],
    required: true
  },

  type: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  quantity: {
    type: Number,
    required: true,
    min: 0
  },

  unit: {
    type: String,
    default: "unit"
  },

  co2Emission: {
    type: Number,
    default: 0
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Activity", activitySchema);
