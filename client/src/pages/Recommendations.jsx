
import { useEffect, useState } from "react";
import API from "../services/api";
import "./Recommendations.css";

const categoryIcons = {
  transport: "🚗",
  electricity: "⚡",
  water: "💧",
  food: "🍎",
  waste: "♻️"
};

const Recommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/recommendations");
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const categories = data?.emissionByCategory || {};
  const totalEmission = Number(data?.totalEmission || 0);
  const categoryEmission = Number(data?.categoryEmission || 0);

  const getPercentage = (emission) => {
    if (totalEmission <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, (Number(emission || 0) / totalEmission) * 100)
    );
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <h2>Analyzing your eco footprint...</h2>
          <p>Preparing personalized recommendations for you.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-page">
        <div className="recommendations-error">
          <div className="recommendation-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={loadRecommendations}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">

      {/* Header */}
      <div className="recommendations-header">
        <div>
          <span className="recommendations-label">
            YOUR SUSTAINABILITY REPORT
          </span>

          <h1>Personalized Recommendations 🌍</h1>

          <p>
            Understand your carbon emissions and discover ways
            to build a greener lifestyle.
          </p>
        </div>

        <button
          className="recommendations-refresh"
          onClick={loadRecommendations}
        >
          ↻ Refresh
        </button>
      </div>

      {data?.message && (
        <div className="recommendations-message">
          🌱 {data.message}
        </div>
      )}

      {data?.highestEmissionCategory ? (
        <>
          {/* Overview */}
          <div className="recommendations-overview">

            <div className="recommendation-overview-card total-emission-card">
              <div className="overview-card-top">
                <span>Total Carbon Emissions</span>
                <span className="overview-icon">🌍</span>
              </div>

              <h2>{totalEmission.toFixed(2)}</h2>
              <p>kg CO₂</p>
              <span className="overview-caption">
                Your recorded carbon footprint
              </span>
            </div>

            <div className="recommendation-overview-card highest-emission-card">
              <div className="overview-card-top">
                <span>Highest Emission Category</span>
                <span className="overview-icon">📊</span>
              </div>

              <h2>
                {categoryIcons[
                  String(data.highestEmissionCategory).toLowerCase()
                ] || "🌱"}{" "}
                {data.highestEmissionCategory}
              </h2>

              <p>{categoryEmission.toFixed(2)} kg CO₂</p>

              <span className="overview-caption">
                Your biggest emission source
              </span>
            </div>
          </div>

          {/* Category emissions */}
          <section className="recommendations-section">
            <div className="recommendations-section-heading">
              <div>
                <h2>Category-wise Emissions</h2>
                <p>See which activities contribute to your footprint.</p>
              </div>
              <span className="section-heading-icon">📈</span>
            </div>

            <div className="emission-category-grid">
              {Object.entries(categories).map(([category, emission]) => {
                const value = Number(emission || 0);
                const percentage = getPercentage(value);

                return (
                  <div className="emission-category-card" key={category}>
                    <div className="emission-card-heading">
                      <div className="emission-category-name">
                        <span className="category-icon">
                          {categoryIcons[category.toLowerCase()] || "🌱"}
                        </span>

                        <h3>{category}</h3>
                      </div>

                      <span className="emission-percentage">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <h2>{value.toFixed(2)} <small>kg CO₂</small></h2>

                    <div className="emission-progress-track">
                      <div
                        className="emission-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="emission-card-footer">
                      Contribution to total emissions
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recommended actions */}
          <section className="recommendations-section">
            <div className="recommendations-section-heading">
              <div>
                <h2>Recommended Actions 💡</h2>
                <p>Small changes can make a big environmental difference.</p>
              </div>
            </div>

            <div className="recommended-actions-list">
              {data.recommendations?.length > 0 ? (
                data.recommendations.map((item, index) => (
                  <div className="recommended-action-card" key={index}>
                    <div className="action-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="action-content">
                      <h3>Eco Action {index + 1}</h3>
                      <p>{item}</p>
                    </div>

                    <span className="action-leaf">🌿</span>
                  </div>
                ))
              ) : (
                <div className="recommendations-empty">
                  No recommendations available right now.
                </div>
              )}
            </div>
          </section>

          {/* Footer message */}
          <div className="recommendations-footer">
            <span>🌱</span>
            <div>
              <h3>Every green action counts!</h3>
              <p>
                Keep tracking your activities and take one sustainable
                step every day.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="recommendations-empty-state">
          <div className="empty-state-icon">🌍</div>
          <h2>Your Green Journey Starts Here!</h2>
          <p>
            No activity data available yet. Add some activities in
            Activity Tracker to receive personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
