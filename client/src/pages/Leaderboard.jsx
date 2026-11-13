
import { useEffect, useState } from "react";
import API from "../services/api";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // LOAD LEADERBOARD
  // =====================================

  const loadLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await API.get("/leaderboard");

      const data = response.data;

      setUsers(
        Array.isArray(data.leaderboard)
          ? data.leaderboard
          : []
      );

      setCurrentUserRank(data.currentUserRank ?? null);

      setTotalUsers(
        data.totalUsers ?? data.leaderboard?.length ?? 0
      );

    } catch (err) {
      console.error("Leaderboard error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load leaderboard. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // =====================================
  // RANK MEDALS
  // =====================================

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";

    return `#${rank}`;
  };

  // =====================================
  // PROFILE INITIALS
  // =====================================

  const getInitials = (name) => {
    return (name || "User")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =====================================
  // FORMAT EMISSIONS
  // =====================================

  const formatEmission = (value) => {
    return `${(Number(value) || 0).toFixed(2)} kg`;
  };

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">
          <h2>🌱 Loading Eco Champions...</h2>
          <p>Calculating the latest rankings.</p>
        </div>
      </div>
    );
  }

  // =====================================
  // ERROR SCREEN
  // =====================================

  if (error && users.length === 0) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">
          <h2>Something went wrong</h2>
          <p>{error}</p>

          <button
            className="leaderboard-refresh"
            onClick={() => loadLeaderboard()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topThree = users.slice(0, 3);

  return (
    <div className="leaderboard-container">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="leaderboard-header">

        <span className="leaderboard-tag">
          🌍 ECO FOOTPRINT HUB
        </span>

        <h1>🏆 Eco Leaderboard</h1>

        <p>
          Celebrate the eco champions making a difference.
          Earn points, improve your green score, and help
          build a sustainable future.
        </p>

        <button
          className="leaderboard-refresh"
          onClick={() => loadLeaderboard(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh Rankings"}
        </button>

        {error && (
          <p role="alert" className="leaderboard-error">
            {error}
          </p>
        )}

      </div>

      {/* =====================================
          OVERVIEW STATISTICS
      ===================================== */}

      <div className="leaderboard-overview">

        <div className="overview-card">
          <span>👥</span>
          <h3>{totalUsers}</h3>
          <p>Total Eco Users</p>
        </div>

        <div className="overview-card">
          <span>🏆</span>
          <h3>{users.length}</h3>
          <p>Ranked Users</p>
        </div>

        <div className="overview-card">
          <span>⭐</span>
          <h3>
            {users.reduce(
              (sum, user) => sum + (Number(user.points) || 0),
              0
            )}
          </h3>
          <p>Combined Points (Top 10)</p>
        </div>

        <div className="overview-card">
          <span>🌱</span>
          <h3>
            {users.reduce(
              (sum, user) =>
                sum + (Number(user.totalActivities) || 0),
              0
            )}
          </h3>
          <p>Activities (Top 10)</p>
        </div>

      </div>

      {/* =====================================
          CURRENT USER RANK
      ===================================== */}

      <div className="current-user-rank">

        <div>
          <span className="current-rank-icon">🎯</span>

          <div>
            <h3>Your Leaderboard Position</h3>
            <p>Keep recording eco-friendly activities to improve your rank.</p>
          </div>
        </div>

        <strong>
          {currentUserRank
            ? `#${currentUserRank}`
            : "Not Ranked"}
        </strong>

      </div>

      {/* =====================================
          TOP THREE CHAMPIONS
      ===================================== */}

      <h2 className="leaderboard-section-title">
        🌟 Top Eco Champions
      </h2>

      {topThree.length > 0 ? (
        <div className="top-champions">

          {topThree.map((user, index) => {
            const rank = user.rank || index + 1;

            return (
              <div
                className={`champion-card champion-${rank}`}
                key={user._id || rank}
              >

                <div className="champion-medal">
                  {getMedal(rank)}
                </div>

                <div className="champion-avatar">
                  {getInitials(user.name)}
                </div>

                <h3>{user.name || "Eco User"}</h3>

                <span className="champion-rank">
                  {rank === 1
                    ? "🥇 Eco Champion"
                    : rank === 2
                    ? "🥈 Green Achiever"
                    : "🥉 Eco Star"}
                </span>

                <div className="champion-stats">

                  <div>
                    <strong>{user.points ?? 0}</strong>
                    <span>Points</span>
                  </div>

                  <div>
                    <strong>{user.greenScore ?? 0}</strong>
                    <span>Green Score</span>
                  </div>

                </div>

                <div className="champion-extra-stats">
                  <p>
                    📋 {user.totalActivities ?? 0} Activities
                  </p>

                  <p>
                    🌍 {formatEmission(user.totalEmission)}
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      ) : (
        <p className="leaderboard-empty">
          No leaderboard participants yet. Start recording
          eco-friendly activities!
        </p>
      )}

      {/* =====================================
          COMPLETE RANKINGS
      ===================================== */}

      <div className="leaderboard-table-section">

        <div className="leaderboard-table-header">

          <div>
            <h2>🌿 All Rankings</h2>
            <p>See how every eco warrior is performing.</p>
          </div>

          <span className="leaderboard-count">
            {users.length} / {totalUsers} Participants
          </span>

        </div>

        <div className="leaderboard-table-wrapper">

          <table className="leaderboard-table">

            <thead>
              <tr>
                <th>Rank</th>
                <th>Eco Warrior</th>
                <th>Points</th>
                <th>Green Score</th>
                <th>Activities</th>
                <th>Carbon Emission</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {users.length > 0 ? (
                users.map((user, index) => {
                  const rank = user.rank || index + 1;

                  return (
                    <tr
                      key={user._id || rank}
                      className={
                        rank <= 3 ? "top-rank-row" : ""
                      }
                    >

                      <td>
                        <span className="rank-badge">
                          {getMedal(rank)}
                        </span>
                      </td>

                      <td>
                        <div className="leaderboard-user">

                          <div className="leaderboard-avatar">
                            {getInitials(user.name)}
                          </div>

                          <strong>
                            {user.name || "Eco User"}
                          </strong>

                        </div>
                      </td>

                      <td>
                        <strong className="points-value">
                          {user.points ?? 0} ⭐
                        </strong>
                      </td>

                      <td>
                        <strong className="score-value">
                          {user.greenScore ?? 0}
                        </strong>
                      </td>

                      <td>
                        {user.totalActivities ?? 0}
                      </td>

                      <td>
                        {formatEmission(user.totalEmission)}
                      </td>

                      <td>
                        <span className="eco-status">
                          {rank === 1
                            ? "Champion"
                            : rank <= 3
                            ? "Top Performer"
                            : "Eco Warrior"}
                        </span>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="leaderboard-empty">
                    No users available in the leaderboard.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================
          FOOTER MESSAGE
      ===================================== */}

      <div className="leaderboard-footer">
        <h2>🌳 Every Green Action Counts!</h2>
        <p>
          Track your activities, complete challenges,
          earn points and climb the Eco Leaderboard.
        </p>
      </div>

    </div>
  );
};

export default Leaderboard;
