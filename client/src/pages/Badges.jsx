
import { useEffect, useState } from "react";
import API from "../services/api";
import "./Badges.css";

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [lockedBadges, setLockedBadges] = useState([]);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState([]);

  const [points, setPoints] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);

  const [earnedCount, setEarnedCount] = useState(0);
  const [lockedCount, setLockedCount] = useState(0);
  const [collectionPercentage, setCollectionPercentage] = useState(0);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // FETCH BADGE DATA
  const fetchBadges = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await API.get("/badges/my");
      const data = response.data;

      setBadges(data.earnedBadges || []);
      setLockedBadges(data.lockedBadges || []);

      setPoints(Number(data.points || 0));
      setTotalActivities(Number(data.totalActivities || 0));
      setCompletedChallenges(Number(data.completedChallenges || 0));

      setEarnedCount(Number(data.earnedCount || 0));
      setLockedCount(Number(data.lockedCount || 0));

      setCollectionPercentage(
        Number(data.collectionPercentage || 0)
      );

      // NEW: Store newly earned badges for the popup.
      setNewlyEarnedBadges(data.newlyEarnedBadges || []);

    } catch (err) {
      console.error("Badge loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load badges. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);


  // CLOSE NEW BADGE POPUP
  const closeBadgePopup = () => {
    setNewlyEarnedBadges([]);
  };


  // BADGE LEVEL
  const getBadgeLevel = (requiredPoints) => {
    const points = Number(requiredPoints || 0);

    if (points >= 500) return "Platinum";
    if (points >= 250) return "Gold";
    if (points >= 100) return "Silver";

    return "Bronze";
  };


  // CALCULATE PROGRESS
  const getProgress = (badge) => {
    const progress = badge.progress || {};

    const requirements = [
      {
        current: Number(progress.points || 0),
        required: Number(progress.requiredPoints || 0)
      },
      {
        current: Number(progress.activities || 0),
        required: Number(progress.requiredActivities || 0)
      },
      {
        current: Number(progress.challenges || 0),
        required: Number(progress.requiredChallenges || 0)
      }
    ].filter(item => item.required > 0);

    if (requirements.length === 0) {
      return 100;
    }

    const percentages = requirements.map(item =>
      Math.min(
        100,
        Math.round((item.current / item.required) * 100)
      )
    );

    return Math.round(
      percentages.reduce((sum, value) => sum + value, 0) /
      percentages.length
    );
  };


  // REMAINING REQUIREMENTS
  const getRemainingRequirements = (badge) => {
    const progress = badge.progress || {};
    const remaining = [];

    const pointsLeft = Math.max(
      0,
      Number(progress.requiredPoints || 0) -
      Number(progress.points || 0)
    );

    const activitiesLeft = Math.max(
      0,
      Number(progress.requiredActivities || 0) -
      Number(progress.activities || 0)
    );

    const challengesLeft = Math.max(
      0,
      Number(progress.requiredChallenges || 0) -
      Number(progress.challenges || 0)
    );

    if (pointsLeft > 0) {
      remaining.push(`${pointsLeft} more points`);
    }

    if (activitiesLeft > 0) {
      remaining.push(`${activitiesLeft} more activities`);
    }

    if (challengesLeft > 0) {
      remaining.push(`${challengesLeft} more challenges`);
    }

    return remaining;
  };


  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };


  if (loading) {
    return (
      <div className="badges-container">
        <div className="badges-loading">
          <h2>🏆 Loading Your Achievements...</h2>
          <p>Preparing your eco badge collection.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="badges-container">

      {/* NEW BADGE EARNED POPUP */}
      {newlyEarnedBadges.length > 0 && (
        <div className="badge-popup-overlay">
          <div
            className="badge-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-popup-title"
          >
            <button
              className="badge-popup-close"
              onClick={closeBadgePopup}
              aria-label="Close notification"
            >
              ×
            </button>

            <div className="badge-popup-confetti">
              🎉 🏆 🎉
            </div>

            <h2 id="badge-popup-title">
              Congratulations!
            </h2>

            <p className="badge-popup-subtitle">
              You have earned a new eco achievement!
            </p>

            <div className="badge-popup-list">
              {newlyEarnedBadges.map((badge) => (
                <div
                  className="badge-popup-item"
                  key={badge._id}
                >
                  <div className="badge-popup-icon">
                    {badge.icon || "🏆"}
                  </div>

                  <h3>{badge.name}</h3>

                  <p>
                    {badge.description ||
                      "You have unlocked a special eco achievement!"}
                  </p>

                  <span className="badge-popup-level">
                    {getBadgeLevel(badge.requiredPoints)}
                  </span>

                  {badge.earnedAt && (
                    <small>
                      Earned on {formatDate(badge.earnedAt)}
                    </small>
                  )}
                </div>
              ))}
            </div>

            <button
              className="badge-popup-button"
              onClick={closeBadgePopup}
            >
              Awesome! Continue
            </button>
          </div>
        </div>
      )}


      {/* HEADER */}
      <div className="badges-header">

        <span className="badges-tag">
          🌍 ECO FOOTPRINT HUB
        </span>

        <h1>🏆 My Eco Badges</h1>

        <p>
          Every green action deserves recognition.
          Collect badges, earn points, and become
          an environmental champion!
        </p>

        <button
          className="badges-refresh"
          onClick={() => fetchBadges()}
          disabled={loading}
        >
          ↻ Refresh Badges
        </button>

      </div>


      {/* ERROR */}
      {error && (
        <div className="badge-error">
          {error}

          <button onClick={() => fetchBadges()}>
            Try Again
          </button>
        </div>
      )}


      {/* SUMMARY */}
      <div className="badge-summary">

        <div className="badge-summary-card">
          <span>⭐</span>
          <h2>{points}</h2>
          <p>Total Eco Points</p>
        </div>

        <div className="badge-summary-card">
          <span>🏆</span>
          <h2>{earnedCount}</h2>
          <p>Badges Earned</p>
        </div>

        <div className="badge-summary-card">
          <span>🔒</span>
          <h2>{lockedCount}</h2>
          <p>Locked Badges</p>
        </div>

        <div className="badge-summary-card">
          <span>🌟</span>
          <h2>{collectionPercentage}%</h2>
          <p>Collection Completed</p>
        </div>

      </div>


      {/* USER STATISTICS */}
      <div className="badge-user-stats">

        <div>
          <span>📊</span>
          <strong>{totalActivities}</strong>
          <p>Total Activities</p>
        </div>

        <div>
          <span>🎯</span>
          <strong>{completedChallenges}</strong>
          <p>Completed Challenges</p>
        </div>

      </div>


      {/* COLLECTION PROGRESS */}
      <div className="badge-collection">

        <div className="badge-section-heading">
          <div>
            <h2>🏆 Your Badge Collection</h2>
            <p>Your progress towards unlocking every badge.</p>
          </div>

          <strong>{collectionPercentage}%</strong>
        </div>

        <div className="badge-progress-track">
          <div
            className="badge-progress-fill"
            style={{
              width: `${collectionPercentage}%`
            }}
          />
        </div>

        <p>
          {earnedCount} out of {earnedCount + lockedCount} badges unlocked
        </p>

      </div>


      {/* EARNED BADGES */}
      <div className="badge-section">

        <div className="badge-section-heading">
          <div>
            <h2>🌟 Earned Badges</h2>
            <p>Achievements you have actually unlocked.</p>
          </div>

          <span className="badge-count">
            {earnedCount} Earned
          </span>
        </div>

        {badges.length > 0 ? (
          <div className="badges-grid">

            {badges.map((badge) => (
              <div
                className="badge-card earned-badge"
                key={badge._id}
              >

                <div className="badge-icon earned-icon">
                  {badge.icon || "🏆"}
                </div>

                <span className="badge-level">
                  {getBadgeLevel(badge.requiredPoints)}
                </span>

                <h3>{badge.name}</h3>

                <p>
                  {badge.description ||
                    "A special achievement for your green efforts."}
                </p>

                <div className="badge-points">
                  ⭐ {badge.requiredPoints} Points Required
                </div>

                {badge.requiredActivities > 0 && (
                  <div className="badge-requirement">
                    📊 {badge.requiredActivities} Activities
                  </div>
                )}

                {badge.requiredChallenges > 0 && (
                  <div className="badge-requirement">
                    🎯 {badge.requiredChallenges} Challenges
                  </div>
                )}

                <div className="badge-earned-label">
                  <span>✓</span> Successfully Unlocked
                </div>

                {badge.earnedAt && (
                  <p className="badge-earned-date">
                    Earned on {formatDate(badge.earnedAt)}
                  </p>
                )}

              </div>
            ))}

          </div>
        ) : (
          <div className="badge-empty">
            <span>🌱</span>
            <h3>No Badges Earned Yet</h3>
            <p>
              Complete eco-friendly activities and challenges
              to unlock your first badge!
            </p>
          </div>
        )}

      </div>


      {/* LOCKED BADGES */}
      <div className="badge-section">

        <div className="badge-section-heading">
          <div>
            <h2>🔒 Locked Badges</h2>
            <p>Complete the requirements to unlock these rewards.</p>
          </div>

          <span className="badge-count locked-count">
            {lockedCount} Locked
          </span>
        </div>

        {lockedBadges.length > 0 ? (
          <div className="badges-grid">

            {lockedBadges.map((badge) => {
              const progress = getProgress(badge);
              const remaining = getRemainingRequirements(badge);

              return (
                <div
                  className="badge-card locked-badge"
                  key={badge._id}
                >

                  <div className="badge-icon locked-icon">
                    {badge.icon || "🔒"}
                  </div>

                  <span className="badge-level">
                    {getBadgeLevel(badge.requiredPoints)}
                  </span>

                  <h3>{badge.name}</h3>

                  <p>
                    {badge.description ||
                      "Keep going to unlock this achievement."}
                  </p>

                  <div className="badge-points">
                    ⭐ {badge.requiredPoints} Points Required
                  </div>

                  {badge.requiredActivities > 0 && (
                    <div className="badge-requirement">
                      📊 {badge.progress?.activities || 0}
                      {" / "}
                      {badge.requiredActivities} Activities
                    </div>
                  )}

                  {badge.requiredChallenges > 0 && (
                    <div className="badge-requirement">
                      🎯 {badge.progress?.challenges || 0}
                      {" / "}
                      {badge.requiredChallenges} Challenges
                    </div>
                  )}

                  <div className="badge-progress">

                    <div className="badge-progress-heading">
                      <span>Requirement Progress</span>
                      <strong>{progress}%</strong>
                    </div>

                    <div className="badge-progress-track">
                      <div
                        className="badge-progress-fill"
                        style={{
                          width: `${progress}%`
                        }}
                      />
                    </div>

                    <p>
                      {remaining.length > 0
                        ? `${remaining.join(", ")} needed`
                        : "Requirements satisfied. Refresh to check your badge!"}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>
        ) : (
          <div className="badge-empty">
            <span>🎉</span>
            <h3>All Badges Unlocked!</h3>
            <p>
              Congratulations! You have unlocked every
              available eco badge.
            </p>
          </div>
        )}

      </div>


      {/* FOOTER */}
      <div className="badge-footer">
        <h2>Keep Going, Eco Champion! 🌍</h2>

        <p>
          Your dedication today creates a greener tomorrow.
          Every point brings you closer to your next achievement.
        </p>
      </div>

    </div>
  );
};

export default Badges;
