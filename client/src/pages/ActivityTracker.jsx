
import React, { useState, useEffect } from "react";
import API from "../services/api";

const typeOptions = {
  transport: ["car", "bike", "bus", "train", "flight"],
  electricity: ["perKwh"],
  water: ["perLiter"],
  food: ["vegetarian", "nonVegetarian", "vegan"],
  waste: ["general", "plastic", "paper", "organic"]
};

const ActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    category: "transport",
    type: "car",
    description: "",
    quantity: ""
  });

  // Fetch activities when page loads
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const response = await API.get("/activities");

      const data = response.data;

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.activities)
        ? data.activities
        : Array.isArray(data.records)
        ? data.records
        : [];

      setActivities(records);
      setError("");

    } catch (error) {
      console.error("Fetch activities error:", error);
      setActivities([]);
      setError(
        error.response?.data?.message ||
        "Failed to fetch activity logs."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData({
        ...formData,
        category: value,
        type: typeOptions[value][0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Add new activity
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.quantity === "" ||
      !Number.isFinite(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      setError("Please enter a valid non-negative quantity.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const payload = {
        category: formData.category,
        type: formData.type,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit:
          formData.category === "transport" ? "km" :
          formData.category === "electricity" ? "kWh" :
          formData.category === "water" ? "litres" :
          formData.category === "food" ? "servings" : "kg"
      };

      const response = await API.post("/activities", payload);

      // Add the saved activity to the list
      const newActivity = response.data.activity || response.data;

      if (newActivity && newActivity._id) {
        setActivities((previous) => [
          newActivity,
          ...previous
        ]);
      } else {
        await fetchActivities();
      }

      setFormData({
        category: "transport",
        type: "car",
        description: "",
        quantity: ""
      });

      setMessage("Activity added successfully!");

    } catch (error) {
      console.error("Add activity error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to log activity."
      );
    }
  };

  // Delete activity
  const deleteActivity = async (id) => {
    try {
      await API.delete(`/activities/${id}`);

      setActivities((previous) =>
        previous.filter((activity) => activity._id !== id)
      );

      setMessage("Activity deleted successfully!");

    } catch (error) {
      console.error("Delete activity error:", error);
      setError("Failed to delete activity.");
    }
  };

  // Calculate total CO2 emissions
  const totalEmission = Array.isArray(activities)
    ? activities.reduce(
        (total, activity) =>
          total + Number(activity.co2Emission || 0),
        0
      )
    : 0;

  return (
    <div className="container">

      <h1>Activity Tracker 🌱</h1>

      <p>
        Record your daily activities and track their
        estimated carbon emissions.
      </p>

      {/* Total Emission */}
      <div className="dashboard-card">
        <h3>Total Carbon Emission</h3>

        <h1>{totalEmission.toFixed(4)} kg CO₂e</h1>

        <p>Based on your recorded activities</p>
      </div>

      {/* Add Activity Form */}
      <div className="dashboard-card">

        <h3>Log Daily Activity</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <form onSubmit={handleSubmit}>

          <label>Activity Category</label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="transport">Transport</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="food">Food</option>
            <option value="waste">Waste</option>
          </select>

          <label>Activity Type</label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            {typeOptions[formData.category].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label>Description</label>

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Example: Travel to college"
            required
          />

          <label>
            Quantity
            {formData.category === "transport" && " (km)"}
            {formData.category === "electricity" && " (kWh)"}
            {formData.category === "water" && " (Litres)"}
            {formData.category === "food" && " (Servings)"}
            {formData.category === "waste" && " (kg)"}
          </label>

          <input
            type="number"
            name="quantity"
            min="0"
            step="any"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            required
          />

          <button type="submit">
            Add Activity
          </button>

        </form>
      </div>

      {/* Activity History */}
      <div className="dashboard-card">

        <h3>Activity History</h3>

        {loading ? (
          <p>Loading activities...</p>
        ) : activities.length === 0 ? (
          <p>No activities recorded yet.</p>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li key={activity._id}>

                <div>
                  <strong>
                    {activity.category?.toUpperCase()}
                  </strong>

                  <p>{activity.description}</p>

                  <p>
                    Type: {activity.description === activity.type
                      ? activity.type
                      : activity.description}
                  </p>

                  <p>
                    Quantity: {activity.quantity} {activity.unit}
                  </p>

                  <strong>
                    CO₂ Emission: {Number(
                      activity.co2Emission || 0
                    ).toFixed(4)} kg
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => deleteActivity(activity._id)}
                >
                  Delete
                </button>

              </li>
            ))}
          </ul>
        )}

      </div>

    </div>
  );
};

export default ActivityTracker;
