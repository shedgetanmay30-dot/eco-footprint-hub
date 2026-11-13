
const mongoose = require("mongoose");

const footprintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  transport: {
    type: Number,
    default: 0
  },
  electricity: {
    type: Number,
    default: 0
  },
  water: {
    type: Number,
    default: 0
  },
  food: {
    type: Number,
    default: 0
  },
  waste: {
    type: Number,
    default: 0
  },
  totalEmission: {
    type: Number,
    default: 0
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("FootprintRecord", footprintSchema);
