
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          API.get("/users/profile"),
          API.get("/users/statistics"),
          API.get("/footprint/history"),
          API.get("/activities"),
          API.get("/activities/total-emission"),
          API.get("/challenges/my"),
          API.get("/footprint/total")
        ]);

        // USER PROFILE
        if (results[0].status === "fulfilled") {
          const data = results[0].value.data;
          setUser(data.user || data);
        }

        // USER STATISTICS
        if (results[1].status === "fulfilled") {
          const data = results[1].value.data;
          setStatistics(data.statistics || data.stats || data);

          if (data.user) {
            setUser((previous) => ({
              ...previous,
              ...data.user
            }));
          }
        }

        // FOOTPRINT HISTORY
        if (results[2].status === "fulfilled") {
          const data = results[2].value.data;
          setRecords(data.records || []);
        }

        // ACTIVITIES
        let activityList = [];

        if (results[3].status === "fulfilled") {
          const data = results[3].value.data;

          activityList = Array.isArray(data)
            ? data
            : data.activities || [];

          setActivities(activityList);
        }

        // TOTAL EMISSIONS
        if (results[4].status === "fulfilled") {
          const data = results[4].value.data;

          setTotal(
            Number(data.totalEmission ?? data.total ?? 0)
          );
        } else if (results[6].status === "fulfilled") {
          const data = results[6].value.data;

          setTotal(
            Number(data.totalEmission ?? data.total ?? 0)
          );
        } else {
          const activityTotal = activityList.reduce(
            (sum, activity) =>
              sum + (Number(activity.co2Emission) || 0),
            0
          );

          setTotal(activityTotal);
        }

        // USER CHALLENGES
        if (results[5].status === "fulfilled") {
          const data = results[5].value.data;

          const challengeList =
            data.userChallenges ||
            data.challenges ||
            data ||
            [];

          setChallenges(
            Array.isArray(challengeList) ? challengeList : []
          );
        }

        // Show warning only if all important requests fail
        if (
          results[0].status === "rejected" &&
          results[3].status === "rejected"
        ) {
          setError("Unable to load dashboard data. Please try again.");
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Something went wrong while loading your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const completedChallenges = challenges.filter(
    (item) =>
      item.status === "completed" ||
      item.userStatus === "completed"
  ).length;

  const totalActivities =
    statistics?.totalActivities ??
    statistics?.activityCount ??
    activities.length;

  const greenPoints = user?.points ?? statistics?.points ?? 0;

  const greenScore =
    user?.greenScore ?? statistics?.greenScore ?? 0;

  const styles = {
    wrapper: {
      backgroundColor: "#0d1117",
      backgroundImage:
        "radial-gradient(circle at top right, rgba(35, 134, 54, 0.08), transparent 500px), radial-gradient(circle at bottom left, rgba(88, 166, 255, 0.04), transparent 500px)",
      color: "#c9d1d9",
      minHeight: "100vh",
      padding: "40px 24px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    container: {
      maxWidth: "1200px",
      margin: "0 auto"
    },

    header: {
      fontSize: "clamp(1.7rem, 4vw, 2.25rem)",
      fontWeight: "700",
      color: "#f0f6fc",
      borderBottom: "1px solid #21262d",
      paddingBottom: "16px",
      marginBottom: "8px"
    },

    welcomeText: {
      fontSize: "1.1rem",
      color: "#8b949e",
      marginBottom: "32px"
    },

    sectionHeading: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#f0f6fc",
      marginTop: "40px",
      marginBottom: "20px"
    },

    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "20px",
      marginBottom: "32px"
    },

    card: {
      backgroundColor: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
    },

    cardTitle: {
      fontSize: "0.85rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#8b949e",
      marginBottom: "12px"
    },

    cardValue: (color) => ({
      fontSize: "2rem",
      fontWeight: "700",
      color,
      margin: 0
    }),

    historyList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      marginBottom: "40px"
    },

    historyItem: {
      backgroundColor: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "8px",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px"
    },

    historyTotal: {
      fontWeight: "600",
      color: "#ff7b72",
      fontSize: "1.05rem",
      margin: 0
    },

    historyDate: {
      color: "#8b949e",
      fontSize: "0.9rem",
      margin: 0
    },

    linksGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginTop: "20px"
    },

    actionLink: (index) => ({
      backgroundColor:
        hoveredLink === index ? "#2c974b" : "#238636",
      color: "#ffffff",
      border: "1px solid rgba(240,246,252,0.1)",
      borderRadius: "8px",
      padding: "16px",
      fontSize: "1rem",
      fontWeight: "600",
      textAlign: "center",
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      transform:
        hoveredLink === index
          ? "translateY(-2px)"
          : "translateY(0)"
    }),

    message: {
      backgroundColor: "#3d1e20",
      border: "1px solid #f85149",
      color: "#ffb4ad",
      padding: "14px",
      borderRadius: "8px",
      marginBottom: "20px"
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <h2>Loading your Eco Dashboard... 🌱</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        <h1 style={styles.header}>
          Welcome to Your Eco Dashboard 🌱
        </h1>

        <p style={styles.welcomeText}>
          Hello, {user?.name || "Eco Tracker"}!
          {" "}Keep making greener choices.
        </p>

        {error && (
          <div style={styles.message}>
            {error}
          </div>
        )}

        {/* DASHBOARD STATISTICS */}
        <div style={styles.cardsGrid}>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Total Carbon Footprint
            </h3>
            <h2 style={styles.cardValue("#ff7b72")}>
              {Number(total).toFixed(2)} kg
            </h2>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Your Green Points
            </h3>
            <h2 style={styles.cardValue("#7ee787")}>
              {greenPoints} pts
            </h2>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Green Score
            </h3>
            <h2 style={styles.cardValue("#58a6ff")}>
              {greenScore}
            </h2>
            <p style={{ color: "#8b949e", marginBottom: 0 }}>
              Out of 100
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Total Activities
            </h3>
            <h2 style={styles.cardValue("#d2a8ff")}>
              {totalActivities}
            </h2>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Completed Challenges
            </h3>
            <h2 style={styles.cardValue("#ffa657")}>
              {completedChallenges}
            </h2>
          </div>

        </div>

        {/* RECENT ACTIVITIES */}
        <h2 style={styles.sectionHeading}>
          Recent Activities 📋
        </h2>

        <div style={styles.historyList}>
          {activities.length > 0 ? (
            [...activities]
              .sort(
                (a, b) =>
                  new Date(b.date) - new Date(a.date)
              )
              .slice(0, 5)
              .map((activity) => (
                <div
                  style={styles.historyItem}
                  key={activity._id}
                >
                  <div>
                    <h3
                      style={{
                        color: "#f0f6fc",
                        margin: "0 0 6px"
                      }}
                    >
                      {activity.description || activity.type}
                    </h3>

                    <p style={{ color: "#8b949e", margin: 0 }}>
                      {activity.category} - {activity.quantity}{" "}
                      {activity.unit}
                    </p>
                  </div>

                  <p style={styles.historyTotal}>
                    {Number(activity.co2Emission || 0).toFixed(2)} kg CO₂
                  </p>
                </div>
              ))
          ) : (
            <div style={styles.historyItem}>
              No activities recorded yet.
            </div>
          )}
        </div>

        {/* FOOTPRINT HISTORY */}
        <h2 style={styles.sectionHeading}>
          Recent Footprint Records 🌍
        </h2>

        <div style={styles.historyList}>
          {records.length > 0 ? (
            records.slice(0, 5).map((record) => (
              <div
                style={styles.historyItem}
                key={record._id}
              >
                <p style={styles.historyTotal}>
                  Total: {Number(record.totalEmission || 0).toFixed(2)} kg CO₂e
                </p>

                <p style={styles.historyDate}>
                  {record.recordedAt
                    ? new Date(record.recordedAt).toLocaleDateString()
                    : "Date unavailable"}
                </p>
              </div>
            ))
          ) : (
            <div style={styles.historyItem}>
              No footprint records available.
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <h2 style={styles.sectionHeading}>
          Quick Actions ⚡
        </h2>

        <div style={styles.linksGrid}>
          {[
            { path: "/calculator", label: "🌍 Calculate Footprint" },
            { path: "/activities", label: "📋 Track Activity" },
            { path: "/challenges", label: "🏆 Eco Challenges" },
            { path: "/tips", label: "🌱 Eco Tips" },
            { path: "/recommendations", label: "💡 Recommendations" },
            { path: "/leaderboard", label: "🥇 Leaderboard" },
            { path: "/badges", label: "🎖️ My Badges" }
          ].map((linkItem, idx) => (
            <Link
              key={linkItem.path}
              to={linkItem.path}
              style={styles.actionLink(idx)}
              onMouseEnter={() => setHoveredLink(idx)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {linkItem.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
