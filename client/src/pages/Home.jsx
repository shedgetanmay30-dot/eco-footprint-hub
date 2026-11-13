import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    co2Saved: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const response = await axios.get("/api/stats/global");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch landing page statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  // Modern UI Glassmorphism Styles Blueprint
  const styles = {
    wrapper: {
      backgroundColor: "#0b130e",
      color: "#f0f4f1",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      minHeight: "100vh",
      padding: "40px 20px",
    },
    hero: {
      textAlign: "center",
      padding: "80px 20px",
      maxWidth: "800px",
      margin: "0 auto 60px auto",
      background: "radial-gradient(circle at top, rgba(34, 197, 94, 0.15) 0%, transparent 60%)",
    },
    title: {
      fontSize: "3.5rem",
      fontWeight: "800",
      letterSpacing: "-1px",
      lineHeight: "1.2",
      background: "linear-gradient(135deg, #ffffff 40%, #4ade80 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "20px",
    },
    subtitle: {
      fontSize: "1.25rem",
      color: "#9ca3af",
      marginBottom: "40px",
      lineHeight: "1.6",
    },
    btnGroup: {
      display: "flex",
      gap: "20px",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    primaryBtn: {
      padding: "14px 28px",
      backgroundColor: "#22c55e",
      color: "#052e16",
      border: "none",
      borderRadius: "30px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
      transition: "transform 0.2s ease",
    },
    secondaryBtn: {
      padding: "14px 28px",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      color: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "30px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      backdropFilter: "blur(10px)",
      transition: "background 0.2s ease",
    },
    section: {
      maxWidth: "1100px",
      margin: "0 auto 80px auto",
      padding: "0 20px",
    },
    sectionTitle: {
      fontSize: "2rem",
      textAlign: "center",
      marginBottom: "40px",
      fontWeight: "700",
      position: "relative",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "24px",
    },
    statCard: {
      background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "16px",
      padding: "30px",
      textAlign: "center",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
    },
    statNumber: {
      fontSize: "2.5rem",
      fontWeight: "800",
      color: "#4ade80",
      marginBottom: "8px",
    },
    statLabel: {
      color: "#9ca3af",
      fontSize: "0.95rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "30px",
    },
    featureCard: {
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "20px",
      padding: "35px",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    featureHeading: {
      fontSize: "1.4rem",
      fontWeight: "600",
      marginBottom: "12px",
      color: "#ffffff",
    },
    featureText: {
      color: "#9ca3af",
      lineHeight: "1.6",
      marginBottom: "24px",
      fontSize: "0.95rem",
    },
    featureLink: {
      color: "#4ade80",
      textDecoration: "none",
      fontWeight: "600",
      fontSize: "0.95rem",
      display: "inline-flex",
      alignItems: "center",
    },
    ctaSection: {
      maxWidth: "800px",
      margin: "40px auto 20px auto",
      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(5, 46, 22, 0.4) 100%)",
      border: "1px solid rgba(34, 197, 94, 0.2)",
      borderRadius: "24px",
      padding: "50px 30px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.wrapper}>
      {/* Hero Display Panel */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Track, Reduce, and Offset Your Carbon Footprint</h1>
        <p style={styles.subtitle}>
          Join thousands of eco-conscious individuals making measurable changes
          for our planet every single day.
        </p>
        <div style={styles.btnGroup}>
          <Link to="/register">
            <button style={styles.primaryBtn}>Get Started Free</button>
          </Link>
          <Link to="/calculator">
            <button style={styles.secondaryBtn}>Calculate Footprint</button>
          </Link>
        </div>
      </section>

      {/* Global Live Counters */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Collective Impact</h2>
        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading system statistics...</p>
        ) : (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.totalUsers || "1,200+"}</h3>
              <p style={styles.statLabel}>Active Members</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.co2Saved || "4,500"} kg</h3>
              <p style={styles.statLabel}>CO₂ Emissions Saved</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.totalActivities || "15,800+"}</h3>
              <p style={styles.statLabel}>Eco Actions Logged</p>
            </div>
          </div>
        )}
      </section>

      {/* Feature Service Index */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Core Functional Suites</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div>
              <h3 style={styles.featureHeading}>Footprint Calculator</h3>
              <p style={styles.featureText}>Input your daily parameters to evaluate your clean emission footprint metrics.</p>
            </div>
            <Link to="/calculator" style={styles.featureLink}>Try Calculator →</Link>
          </div>
          <div style={styles.featureCard}>
            <div>
              <h3 style={styles.featureHeading}>Action Tracker</h3>
              <p style={styles.featureText}>Log regular green behaviors such as walking or switching low-power devices.</p>
            </div>
            <Link to="/activities" style={styles.featureLink}>Track Actions →</Link>
          </div>
          <div style={styles.featureCard}>
            <div>
              <h3 style={styles.featureHeading}>Community Challenges</h3>
              <p style={styles.featureText}>Compete in community sustainability streaks and gain positions on the scoreboard.</p>
            </div>
            <Link to="/challenges" style={styles.featureLink}>View Challenges →</Link>
          </div>
        </div>
      </section>

      {/* Bottom Retention Card */}
      <section style={styles.ctaSection}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "15px", fontWeight: "700" }}>Ready to make a difference?</h2>
        <p style={{ color: "#9ca3af", marginBottom: "30px", fontSize: "1rem" }}>Start tracking your eco actions today and earn green badges along the way.</p>
        <Link to="/login">
          <button style={styles.primaryBtn}>Sign In to Your Hub</button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
