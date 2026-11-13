
const emissionFactors = {
  transport: {
    car: 0.21,
    bike: 0.10,
    bus: 0.10,
    train: 0.04,
    flight: 0.25
  },

  electricity: {
    perKwh: 0.70
  },

  water: {
    perLiter: 0.0003
  },

  food: {
    vegetarian: 1.5,
    nonVegetarian: 3.5,
    vegan: 1.0
  },

  waste: {
    general: 0.5,
    plastic: 1.5,
    paper: 0.3,
    organic: 0.2
  }
};

module.exports = emissionFactors;
