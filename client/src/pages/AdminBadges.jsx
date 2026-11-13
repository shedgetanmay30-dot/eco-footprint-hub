
import { useEffect, useState } from "react";
import API from "../services/api";
import "./AdminBadges.css";

const initialForm = {
  name: "",
  description: "",
  icon: "🌱",
  requiredPoints: 100,
  requiredActivities: 0,
  requiredChallenges: 0
};

const AdminBadges = () => {
  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // FETCH ALL BADGES
  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/badges");

      // Supports both array and { badges: [] } responses
      const badgeData = Array.isArray(response.data)
        ? response.data
        : response.data.badges || [];

      setBadges(badgeData);

    } catch (err) {
      console.error("Badge fetching error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load badges."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // CREATE BADGE
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim() || !form.description.trim()) {
      setError("Please enter badge name and description.");
      return;
    }

    const requiredPoints = Number(form.requiredPoints);
    const requiredActivities = Number(form.requiredActivities);
    const requiredChallenges = Number(form.requiredChallenges);

    if (
      !Number.isInteger(requiredPoints) ||
      !Number.isInteger(requiredActivities) ||
      !Number.isInteger(requiredChallenges) ||
      requiredPoints < 0 ||
      requiredActivities < 0 ||
      requiredChallenges < 0
    ) {
      setError("Requirements must be non-negative whole numbers.");
      return;
    }

    try {
      setSaving(true);

      const badgeData = {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        requiredPoints,
        requiredActivities,
        requiredChallenges
      };

      const response = await API.post("/badges", badgeData);

      setMessage(
        response.data.message || "Badge created successfully!"
      );

      setForm(initialForm);

      await fetchBadges();

    } catch (err) {
      console.error("Badge creation error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to create badge."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE BADGE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this badge?"
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      const response = await API.delete(`/badges/${id}`);

      setMessage(
        response.data.message || "Badge deleted successfully!"
      );

      setBadges((prev) =>
        prev.filter((badge) => badge._id !== id)
      );

    } catch (err) {
      console.error("Badge deletion error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to delete badge."
      );
    }
  };

  // BADGE LEVEL
  const getBadgeLevel = (points) => {
    if (points >= 500) return "Platinum";
    if (points >= 250) return "Gold";
    if (points >= 100) return "Silver";
    return "Bronze";
  };

  return (
    <div className="admin-badges-container">

      {/* HEADER */}
      <div className="admin-badges-header">
        <span>🌍 ECO FOOTPRINT HUB</span>

        <h1>🏆 Badge Management</h1>

        <p>
          Create achievement badges and reward users
          for their eco-friendly activities.
        </p>
      </div>

      {/* STATISTICS */}
      <div className="admin-badge-stats">

        <div className="admin-badge-stat">
          <span>🏆</span>
          <h2>{badges.length}</h2>
          <p>Total Badges</p>
        </div>

        <div className="admin-badge-stat">
          <span>⭐</span>
          <h2>
            {badges.filter((badge) =>
              badge.requiredPoints >= 250
            ).length}
          </h2>
          <p>Advanced Badges</p>
        </div>

        <div className="admin-badge-stat">
          <span>🌱</span>
          <h2>
            {badges.filter((badge) =>
              Number(badge.requiredPoints) <= 100
            ).length}
          </h2>
          <p>Beginner Badges</p>
        </div>

      </div>

      {/* MESSAGES */}
      {message && (
        <div className="admin-badge-message success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="admin-badge-message error">
          ⚠ {error}
        </div>
      )}

      {/* CREATE BADGE FORM */}
      <div className="admin-badge-form-section">

        <div className="admin-badge-section-heading">
          <h2>➕ Create New Badge</h2>
          <p>Configure the requirements users must achieve.</p>
        </div>

        <form
          className="admin-badge-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-badge-form-grid">

            {/* BADGE NAME */}
            <div className="admin-badge-field">
              <label>Badge Name *</label>

              <input
                type="text"
                name="name"
                placeholder="Example: Eco Warrior"
                value={form.name}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </div>

            {/* BADGE ICON */}
            <div className="admin-badge-field">
              <label>Badge Icon</label>

              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
              >
                <option value="🌱">🌱 Seedling</option>
                <option value="🌍">🌍 Earth</option>
                <option value="♻️">♻️ Recycling</option>
                <option value="🌳">🌳 Tree</option>
                <option value="🏆">🏆 Trophy</option>
                <option value="⭐">⭐ Star</option>
                <option value="💚">💚 Green Heart</option>
                <option value="🚲">🚲 Cycling</option>
                <option value="⚡">⚡ Energy Saver</option>
                <option value="💧">💧 Water Saver</option>
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="admin-badge-field full-width">
              <label>Badge Description *</label>

              <textarea
                name="description"
                placeholder="Describe how users can earn this badge..."
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={250}
                required
              />
            </div>

          </div>

          {/* REQUIREMENTS */}
          <div className="admin-badge-requirements">

            <h3>🎯 Achievement Requirements</h3>

            <p>
              Users must satisfy all configured requirements
              to earn this badge.
            </p>

            <div className="admin-badge-form-grid">

              <div className="admin-badge-field">
                <label>⭐ Required Eco Points</label>

                <input
                  type="number"
                  name="requiredPoints"
                  min="0"
                  step="1"
                  value={form.requiredPoints}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-badge-field">
                <label>📊 Required Activities</label>

                <input
                  type="number"
                  name="requiredActivities"
                  min="0"
                  step="1"
                  value={form.requiredActivities}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-badge-field">
                <label>🎯 Required Challenges</label>

                <input
                  type="number"
                  name="requiredChallenges"
                  min="0"
                  step="1"
                  value={form.requiredChallenges}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

          </div>

          <button
            type="submit"
            className="admin-badge-submit"
            disabled={saving}
          >
            {saving ? "Creating Badge..." : "➕ Create Badge"}
          </button>

        </form>

      </div>

      {/* ALL BADGES */}
      <div className="admin-all-badges">

        <div className="admin-badge-section-heading">
          <div>
            <h2>🏅 All Available Badges</h2>
            <p>Manage the achievement badges in your system.</p>
          </div>

          <button
            className="admin-badge-refresh"
            onClick={fetchBadges}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-badge-empty">
            Loading badges...
          </div>
        ) : badges.length === 0 ? (
          <div className="admin-badge-empty">
            <span>🌱</span>
            <h3>No Badges Created</h3>
            <p>Create your first badge using the form above.</p>
          </div>
        ) : (

          <div className="admin-badge-grid">

            {badges.map((badge) => (
              <div
                className="admin-badge-card"
                key={badge._id}
              >

                <div className="admin-badge-card-icon">
                  {badge.icon || "🏆"}
                </div>

                <span className="admin-badge-level">
                  {getBadgeLevel(badge.requiredPoints)}
                </span>

                <h3>{badge.name}</h3>

                <p className="admin-badge-description">
                  {badge.description}
                </p>

                <div className="admin-badge-details">

                  <div>
                    <span>⭐ Required Points</span>
                    <strong>{badge.requiredPoints}</strong>
                  </div>

                  <div>
                    <span>📊 Activities</span>
                    <strong>{badge.requiredActivities || 0}</strong>
                  </div>

                  <div>
                    <span>🎯 Challenges</span>
                    <strong>{badge.requiredChallenges || 0}</strong>
                  </div>

                </div>

                <button
                  className="admin-badge-delete"
                  onClick={() => handleDelete(badge._id)}
                >
                  🗑 Delete Badge
                </button>

              </div>
            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminBadges;
