
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import "./Challenges.css";

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [totalPoints, setTotalPoints] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  // CATEGORY ICONS
  const getCategoryIcon = (category) => {
    const icons = {
      transport: "🚴",
      electricity: "⚡",
      water: "💧",
      food: "🥗",
      waste: "♻️",
      general: "🌱"
    };

    return icons[String(category || "").toLowerCase()] || "🌍";
  };

  // SHOW MESSAGE
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // LOAD CHALLENGES
  const loadChallenges = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await API.get("/challenges");
      const data = response.data || {};

      // Supports both array and object API responses
      const challengeList = Array.isArray(data)
        ? data
        : data.challenges || [];

      setChallenges(challengeList);

      if (data.totalPoints !== undefined) {
        setTotalPoints(data.totalPoints);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to load challenges. Please try again.",
        "error"
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // JOIN CHALLENGE
  const joinChallenge = async (id) => {
    try {
      setActionLoading(id);
      setMessage("");
      setNewBadges([]);

      const response = await API.post(`/challenges/${id}/join`);
      const data = response.data || {};

      showMessage(
        data.message || "Challenge joined successfully! 🌱",
        "success"
      );

      if (data.totalPoints !== undefined) {
        setTotalPoints(data.totalPoints);
      }

      await loadChallenges(false);
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to join challenge. Please try again.",
        "error"
      );
    } finally {
      setActionLoading("");
    }
  };

  // DAILY CHECK-IN
  const checkInChallenge = async (id) => {
    try {
      setActionLoading(id);
      setMessage("");
      setNewBadges([]);

      const response = await API.post(`/challenges/${id}/check-in`);
      const data = response.data || {};

      if (data.totalPoints !== undefined) {
        setTotalPoints(data.totalPoints);
      }

      const earnedBadges =
        data.newBadges || data.newlyEarnedBadges || [];

      if (Array.isArray(earnedBadges)) {
        setNewBadges(earnedBadges);
      }

      if (data.pointsEarned > 0) {
        showMessage(
          `${data.message || "Challenge completed!"} 🎉 You earned ${data.pointsEarned} points!`,
          "success"
        );
      } else {
        showMessage(
          data.message || "Daily check-in successful! 🌱",
          "success"
        );
      }

      await loadChallenges(false);
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to check in. Please try again.",
        "error"
      );

      await loadChallenges(false);
    } finally {
      setActionLoading("");
    }
  };

  // PROGRESS PERCENTAGE
  const getProgress = (item) => {
    const target = Number(item.targetProgress || 1);
    const current = Number(item.userProgress || 0);

    if (target <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, Math.round((current / target) * 100))
    );
  };

  // CATEGORY NAME
  const formatCategory = (category) => {
    if (!category) return "General";

    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // PROGRESS UNIT
  const getProgressUnit = (item) => {
    const isGeneral =
      String(item.category).toLowerCase() === "general";

    return isGeneral ? "days" : item.unit || "units";
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN");
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="challenges-container">
        <div className="challenges-loading">
          <h2>🌱 Loading Eco Challenges...</h2>
          <p>Preparing your sustainability journey.</p>
        </div>
      </div>
    );
  }

  const joinedCount = challenges.filter(
    (item) => item.joined
  ).length;

  const completedCount = challenges.filter(
    (item) => item.userStatus === "completed"
  ).length;

  const activeCount = joinedCount - completedCount;

  return (
    <div className="challenges-container">

      {/* HEADER */}
      <div className="challenges-header">
        <div>
          <span className="challenges-tag">
            🌍 ECO FOOTPRINT HUB
          </span>

          <h1>Eco Challenges 🌱</h1>

          <p>
            Take small steps towards a greener planet.
            Complete challenges, earn rewards, and become
            an Eco Champion!
          </p>
        </div>

        <button
          className="challenge-refresh"
          onClick={() => loadChallenges(false)}
          disabled={!!actionLoading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="challenge-summary">

        <div className="challenge-summary-card">
          <span>🌍 Available Challenges</span>
          <strong>{challenges.length}</strong>
        </div>

        <div className="challenge-summary-card">
          <span>🚀 Joined Challenges</span>
          <strong>{joinedCount}</strong>
        </div>

        <div className="challenge-summary-card">
          <span>🔥 Active Challenges</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="challenge-summary-card">
          <span>🏆 Completed Challenges</span>
          <strong>{completedCount}</strong>
        </div>

      </div>

      {/* TOTAL POINTS */}
      {totalPoints !== null && (
        <div className="challenge-points-banner">
          <span>⭐ Your Total Points</span>
          <strong>{totalPoints}</strong>
        </div>
      )}

      {/* MESSAGE */}
      {message && (
        <div
          className={`challenge-message ${messageType}`}
          role="status"
        >
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {/* NEWLY EARNED BADGES */}
      {newBadges.length > 0 && (
        <div className="challenge-message success">
          <div>
            <strong>🎉 New Badge Earned!</strong>

            {newBadges.map((badge) => (
              <p key={badge._id || badge.badge?._id || badge.name}>
                {badge.icon || badge.badge?.icon || "🏅"}{" "}
                {badge.name || badge.badge?.name || "New Eco Badge"}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* SECTION HEADER */}
      <div className="challenges-section-header">
        <div>
          <h2>Explore Challenges</h2>
          <p>
            Choose a challenge and start making a difference.
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {challenges.length === 0 ? (
        <div className="challenge-empty">
          <div>🌳</div>
          <h2>No Challenges Available</h2>
          <p>
            New eco challenges will appear here.
            Please check back later!
          </p>

          <button
            className="challenge-button"
            onClick={() => loadChallenges(false)}
          >
            Try Again
          </button>
        </div>
      ) : (

        /* CHALLENGE CARDS */
        <div className="challenges-grid">

          {challenges.map((item) => {
            const progress = getProgress(item);
            const joined = Boolean(item.joined);

            const completed =
              item.userStatus === "completed";

            const isGeneral =
              String(item.category).toLowerCase() === "general";

            const isActionLoading =
              actionLoading === item._id;

            const current = Number(item.userProgress || 0);
            const target = Number(item.targetProgress || 1);

            return (
              <div
                className={`challenge-card ${
                  completed ? "completed-card" : ""
                }`}
                key={item._id}
              >

                {/* CARD HEADER */}
                <div className="challenge-card-top">

                  <div className="challenge-icon">
                    {getCategoryIcon(item.category)}
                  </div>

                  <span className="challenge-category">
                    {formatCategory(item.category)}
                  </span>

                  {completed && (
                    <span className="challenge-status-badge">
                      Completed
                    </span>
                  )}

                </div>

                {/* TITLE */}
                <h2>{item.title}</h2>

                <p className="challenge-description">
                  {item.description}
                </p>

                {/* DETAILS */}
                <div className="challenge-details">

                  <div className="challenge-detail">
                    <span>🏆</span>

                    <div>
                      <strong>{item.points ?? 0}</strong>
                      <small>Reward Points</small>
                    </div>
                  </div>

                  <div className="challenge-detail">
                    <span>📅</span>

                    <div>
                      <strong>{item.duration ?? 0} Days</strong>
                      <small>Duration</small>
                    </div>
                  </div>

                </div>

                {/* ACTIVITY INFORMATION */}
                {item.activityType && (
                  <p className="challenge-activity">
                    <strong>Activity:</strong>{" "}
                    {item.activityType}
                  </p>
                )}

                {item.targetQuantity && !isGeneral && (
                  <p className="challenge-activity">
                    <strong>Target:</strong>{" "}
                    {item.targetQuantity} {item.unit || "units"}
                  </p>
                )}

                {/* USER PROGRESS */}
                {joined && (
                  <div className="challenge-progress">

                    <div className="progress-heading">
                      <strong>
                        {isGeneral
                          ? "Daily Check-in Progress"
                          : "Activity Progress"}
                      </strong>

                      <span>{progress}%</span>
                    </div>

                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label="Challenge progress"
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="progress-count">
                      {current} / {target} {getProgressUnit(item)}
                    </p>

                    {isGeneral && !completed && (
                      <p className="challenge-hint">
                        Complete one check-in each day.
                        Come back tomorrow for your next check-in.
                      </p>
                    )}

                    {!isGeneral && !completed && (
                      <p className="challenge-hint">
                        Log matching activities to increase your progress.
                      </p>
                    )}

                    {completed && item.completedAt && (
                      <p className="challenge-hint">
                        Completed on: {formatDate(item.completedAt)}
                      </p>
                    )}

                  </div>
                )}

                {/* STATUS AND ACTION */}
                <div className="challenge-card-footer">

                  {completed ? (

                    <div className="challenge-completed">
                      ✅ Challenge Completed!
                    </div>

                  ) : !joined ? (

                    <button
                      className="challenge-button"
                      onClick={() => joinChallenge(item._id)}
                      disabled={!!actionLoading}
                    >
                      {isActionLoading
                        ? "Joining..."
                        : "Join Challenge →"}
                    </button>

                  ) : isGeneral ? (

                    <button
                      className="challenge-button checkin-button"
                      onClick={() => checkInChallenge(item._id)}
                      disabled={!!actionLoading}
                    >
                      {isActionLoading
                        ? "Checking in..."
                        : "Daily Check-in ✓"}
                    </button>

                  ) : (

                    <div className="challenge-hint activity-hint">
                      🌱 Your progress updates when you log a matching activity.
                    </div>

                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* FOOTER */}
      <div className="challenge-footer-banner">
        <h2>Every Green Action Matters 🌍</h2>

        <p>
          Your small actions today create a cleaner,
          healthier planet tomorrow.
        </p>
      </div>

    </div>
  );
};

export default Challenges;
