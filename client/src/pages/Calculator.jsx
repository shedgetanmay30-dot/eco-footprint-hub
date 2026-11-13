
import { useState } from "react";
import API from "../services/api";

const typeOptions = {
  transport: [
    { value: "car", label: "Car" },
    { value: "bike", label: "Bike" },
    { value: "bus", label: "Bus" },
    { value: "train", label: "Train" },
    { value: "flight", label: "Flight" }
  ],
  electricity: [
    { value: "perKwh", label: "Electricity (kWh)" }
  ],
  water: [
    { value: "perLiter", label: "Water (Litres)" }
  ],
  food: [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "nonVegetarian", label: "Non-Vegetarian" },
    { value: "vegan", label: "Vegan" }
  ],
  waste: [
    { value: "general", label: "General Waste" },
    { value: "plastic", label: "Plastic" },
    { value: "paper", label: "Paper" },
    { value: "organic", label: "Organic" }
  ]
};

const Calculator = () => {
  const [activities, setActivities] = useState([
    { category: "transport", type: "car", quantity: 10 },
    { category: "electricity", type: "perKwh", quantity: 5 }
  ]);

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (index, field, value) => {
    const updated = [...activities];

    if (field === "category") {
      updated[index] = {
        ...updated[index],
        category: value,
        type: typeOptions[value][0].value
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: field === "quantity" ? value : value
      };
    }

    setActivities(updated);
    setResult(null);
    setMessage("");
  };

  // Add new activity
  const addActivity = () => {
    setActivities([
      ...activities,
      { category: "transport", type: "car", quantity: 1 }
    ]);

    setResult(null);
    setMessage("");
  };

  // Remove activity
  const removeActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
    setResult(null);
    setMessage("");
  };

  // Calculate carbon footprint
  const calculate = async (e) => {
    e.preventDefault();

    const invalidActivity = activities.some(
      (activity) =>
        activity.quantity === "" ||
        !Number.isFinite(Number(activity.quantity)) ||
        Number(activity.quantity) < 0
    );

    if (invalidActivity) {
      setMessage("Please enter valid non-negative quantities.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      const payload = {
        activities: activities.map((activity) => ({
          ...activity,
          quantity: Number(activity.quantity)
        }))
      };

      const response = await API.post(
        "/footprint/calculate",
        payload
      );

      setResult(response.data.record);

      setMessage("Footprint calculated successfully!");

    } catch (error) {
      console.error("Footprint calculation error:", error);

      setMessage(
        error.response?.data?.message ||
        "Calculation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">

      <h1>Carbon Footprint Calculator 🌍</h1>

      <p>
        Enter your daily activities to calculate your
        estimated carbon footprint.
      </p>

      <form onSubmit={calculate}>

        {activities.map((activity, index) => (

          <div className="dashboard-card" key={index}>

            <h3>Activity {index + 1}</h3>

            {/* Category */}
            <label>Category</label>

            <select
              value={activity.category}
              onChange={(e) =>
                handleChange(index, "category", e.target.value)
              }
            >
              <option value="transport">Transport</option>
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="food">Food</option>
              <option value="waste">Waste</option>
            </select>

            {/* Type */}
            <label>Type</label>

            <select
              value={activity.type}
              onChange={(e) =>
                handleChange(index, "type", e.target.value)
              }
            >
              {typeOptions[activity.category].map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {/* Quantity */}
            <label>
              Quantity
              {activity.category === "transport" && " (km)"}
              {activity.category === "electricity" && " (kWh)"}
              {activity.category === "water" && " (Litres)"}
              {activity.category === "food" && " (Servings)"}
              {activity.category === "waste" && " (kg)"}
            </label>

            <input
              type="number"
              min="0"
              step="any"
              required
              value={activity.quantity}
              onChange={(e) =>
                handleChange(index, "quantity", e.target.value)
              }
              placeholder="Enter quantity"
            />

            {/* Remove Activity */}
            {activities.length > 1 && (
              <button
                type="button"
                onClick={() => removeActivity(index)}
              >
                Remove Activity
              </button>
            )}

          </div>

        ))}

        {/* Add Activity */}
        <button
          type="button"
          onClick={addActivity}
        >
          + Add Activity
        </button>

        {/* Calculate */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Footprint"}
        </button>

      </form>

      {/* Message */}
      {message && (
        <p>{message}</p>
      )}

      {/* Result */}
      {result && (

        <div className="dashboard-card">

          <h2>Your Total Footprint 🌱</h2>

          <h1>
            {Number(result.totalEmission).toFixed(4)} kg CO₂e
          </h1>

          <h3>Category-wise Emissions</h3>

          <p>🚗 Transport: {result.transport} kg CO₂e</p>

          <p>⚡ Electricity: {result.electricity} kg CO₂e</p>

          <p>💧 Water: {result.water} kg CO₂e</p>

          <p>🍃 Food: {result.food} kg CO₂e</p>

          <p>♻️ Waste: {result.waste} kg CO₂e</p>

        </div>

      )}

    </div>
  );
};

export default Calculator;
