
import { useEffect, useState } from "react";
import API from "../services/api";

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [challenge, setChallenge] = useState({
    title: "",
    description: "",
    points: 50,
    duration: 7,
    category: "General"
  });

  const [tip, setTip] = useState({
    title: "",
    description: "",
    category: "General"
  });

  // LOAD ADMIN DASHBOARD DATA
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboard, emission, analyticsResponse] =
        await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/admin/emission-report"),
          API.get("/admin/analytics")
        ]);

      setStats(dashboard.data || {});
      setReport(emission.data.report || {});

      setAnalytics(
        analyticsResponse.data.analytics ||
        analyticsResponse.data ||
        {}
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load admin dashboard data. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CREATE CHALLENGE
  const createChallenge = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await API.post("/challenges", challenge);

      setMessage("Challenge created successfully!");

      setChallenge({
        title: "",
        description: "",
        points: 50,
        duration: 7,
        category: "General"
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to create challenge."
      );
    } finally {
      setSaving(false);
    }
  };

  // CREATE TIP
  const createTip = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await API.post("/tips", tip);

      setMessage("Eco tip added successfully!");

      setTip({
        title: "",
        description: "",
        category: "General"
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to add eco tip."
      );
    } finally {
      setSaving(false);
    }
  };

  // FORMAT NUMBERS
  const formatNumber = (value) => {
    return Number(value || 0).toFixed(2);
  };

  // POPULAR CHALLENGES
  const popularChallenges =
    analytics.popularChallenges || [];

  // READABLE CATEGORY NAMES
  const formatCategory = (category) => {
    return category
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container admin-panel">

      <h1>Admin Dashboard 🛠️</h1>

      <p>
        Manage users, activities, challenges, tips and
        environmental analytics.
      </p>

      {message && (
        <p className="admin-message success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="admin-message error-message">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={loadData}
        disabled={loading}
      >
        Refresh Dashboard 🔄
      </button>

      {/* ADMIN ANALYTICS */}
      <h2>Advanced Admin Analytics 📊</h2>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Total Registered Users</h3>
          <h2>
            {analytics.totalUsers ?? stats.totalUsers ?? 0}
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>Active Users</h3>
          <h2>{analytics.activeUsers ?? 0}</h2>
          <p>Active in the last 30 days</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Activities</h3>
          <h2>
            {analytics.totalActivities ??
              stats.totalActivities ?? 0}
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>Total Carbon Emissions</h3>
          <h2>
            {formatNumber(
              analytics.totalEmission ??
              stats.totalEmission
            )} kg
          </h2>
          <p>CO₂ equivalent</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Challenges</h3>
          <h2>
            {analytics.totalChallenges ??
              stats.totalChallenges ?? 0}
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>Total Eco Tips</h3>
          <h2>{stats.totalTips ?? 0}</h2>
        </div>

      </div>

      {/* POPULAR CHALLENGES */}
      <h2>Most Popular Challenges 🏆</h2>

      {popularChallenges.length > 0 ? (
        <div className="dashboard-cards">

          {popularChallenges.map((item, index) => (
            <div
              className="dashboard-card"
              key={item._id || item.challengeId || index}
            >
              <h3>
                {index + 1}.{" "}
                {item.title ||
                  item.challengeTitle ||
                  item.name ||
                  "Eco Challenge"}
              </h3>

              <p>
                Participants:{" "}
                {item.participants ??
                  item.totalParticipants ??
                  item.count ??
                  0}
              </p>
            </div>
          ))}

        </div>
      ) : (
        <p>No challenge participation data available yet.</p>
      )}

      {/* EMISSION REPORT */}
      <h2>Category-wise Emission Report 🌍</h2>

      <div className="dashboard-cards">

        {Object.entries(report)
          .filter(([key]) => key !== "_id")
          .map(([key, value]) => (
            <div className="dashboard-card" key={key}>
              <h3>{formatCategory(key)}</h3>
              <h2>{formatNumber(value)}</h2>
              <p>kg CO₂e</p>
            </div>
          ))}

        {Object.keys(report).filter(
          (key) => key !== "_id"
        ).length === 0 && (
          <p>No emission report data available.</p>
        )}

      </div>

      {/* CREATE CHALLENGE */}
      <h2>Create Eco Challenge 🌱</h2>

      <form onSubmit={createChallenge}>

        <label>Challenge Title</label>
        <input
          type="text"
          placeholder="Enter challenge title"
          value={challenge.title}
          required
          onChange={(e) =>
            setChallenge({
              ...challenge,
              title: e.target.value
            })
          }
        />

        <label>Description</label>
        <textarea
          placeholder="Enter challenge description"
          value={challenge.description}
          required
          onChange={(e) =>
            setChallenge({
              ...challenge,
              description: e.target.value
            })
          }
        />

        <label>Challenge Category</label>
        <select
          value={challenge.category}
          onChange={(e) =>
            setChallenge({
              ...challenge,
              category: e.target.value
            })
          }
        >
          <option value="General">General</option>
          <option value="transport">Transport</option>
          <option value="electricity">Electricity</option>
          <option value="water">Water</option>
          <option value="food">Food</option>
          <option value="waste">Waste</option>
        </select>

        <label>Reward Points</label>
        <input
          type="number"
          min="1"
          value={challenge.points}
          required
          onChange={(e) =>
            setChallenge({
              ...challenge,
              points: Number(e.target.value)
            })
          }
        />

        <label>Duration (Days)</label>
        <input
          type="number"
          min="1"
          value={challenge.duration}
          required
          onChange={(e) =>
            setChallenge({
              ...challenge,
              duration: Number(e.target.value)
            })
          }
        />

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Challenge"}
        </button>

      </form>

      {/* ADD ECO TIP */}
      <h2>Add Eco Tip 💡</h2>

      <form onSubmit={createTip}>

        <label>Tip Title</label>
        <input
          type="text"
          placeholder="Enter tip title"
          required
          value={tip.title}
          onChange={(e) =>
            setTip({
              ...tip,
              title: e.target.value
            })
          }
        />

        <label>Tip Description</label>
        <textarea
          placeholder="Enter eco tip description"
          required
          value={tip.description}
          onChange={(e) =>
            setTip({
              ...tip,
              description: e.target.value
            })
          }
        />

        <label>Tip Category</label>
        <select
          value={tip.category}
          onChange={(e) =>
            setTip({
              ...tip,
              category: e.target.value
            })
          }
        >
          <option value="General">General</option>
          <option value="transport">Transport</option>
          <option value="electricity">Electricity</option>
          <option value="water">Water</option>
          <option value="food">Food</option>
          <option value="waste">Waste</option>
        </select>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add Eco Tip"}
        </button>

      </form>

    </div>
  );
};

export default AdminPanel;
