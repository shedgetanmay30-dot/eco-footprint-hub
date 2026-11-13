
const emissionFactors = require("./emissionFactors");

const calculateFootprint = (category, type, quantity) => {
  const amount = Number(quantity);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Quantity must be a valid non-negative number");
  }

  let emission = 0;

  switch (category) {

    case "transport":
      if (!emissionFactors.transport[type]) {
        throw new Error("Invalid transport type");
      }

      emission =
        amount * emissionFactors.transport[type];
      break;

    case "electricity":
      emission =
        amount * emissionFactors.electricity.perKwh;
      break;

    case "water":
      emission =
        amount * emissionFactors.water.perLiter;
      break;

    case "food":
      if (!emissionFactors.food[type]) {
        throw new Error("Invalid food type");
      }

      emission =
        amount * emissionFactors.food[type];
      break;

    case "waste":
      if (!emissionFactors.waste[type]) {
        throw new Error("Invalid waste type");
      }

      emission =
        amount * emissionFactors.waste[type];
      break;

    default:
      throw new Error("Invalid activity category");
  }

  return Number(emission.toFixed(4));
};

module.exports = calculateFootprint;
