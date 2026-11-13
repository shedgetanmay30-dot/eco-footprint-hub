import { useEffect, useState } from "react";
import API from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [initialUser, setInitialUser] = useState(null); // Tracks original state to make form actions dynamic
  const [message, setMessage] = useState("");

  // States for advanced micro-interaction animations
  const [focusedField, setFocusedField] = useState("");
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isBtnActive, setIsBtnActive] = useState(false);

  useEffect(() => {
    API.get("/users/profile")
      .then((response) => {
        const userData = response.data;
        setUser(userData);
        setInitialUser(userData); // Store baseline to check for changes dynamically
      })
      .catch((error) => console.log(error));
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const response = await API.put("/users/profile", {
        name: user.name,
        email: user.email
      });

      const updatedData = response.data.user || response.data;
      setUser(updatedData);
      setInitialUser(updatedData); // Reset baseline to newly updated values
      setMessage("Profile updated successfully!");
      
      // Auto-clear success messages dynamically after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed");
    }
  };

  // Dynamic state check: Disable button if fields match original database state exactly
  const isFormUnchanged = initialUser && 
    user?.name === initialUser.name && 
    user?.email === initialUser.email;

  const isSuccess = message.includes("successfully");

  // Advanced Industrial Glassmorphism CSS Object Styles
  const styles = {
    wrapper: {
      backgroundColor: "#0d1117",
      backgroundImage: "radial-gradient(circle at top right, rgba(35, 134, 54, 0.05), transparent 500px), radial-gradient(circle at bottom left, rgba(88, 166, 255, 0.04), transparent 500px)",
      color: "#c9d1d9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    card: {
      backgroundColor: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "12px",
      padding: "44px 36px",
      width: "100%",
      maxWidth: "500px",
      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset",
      backdropFilter: "blur(8px)",
    },
    heading: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#f0f6fc",
      marginBottom: "24px",
      letterSpacing: "-0.5px",
      borderBottom: "1px solid #21262d",
      paddingBottom: "12px"
    },
    badgeRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "28px",
    },
    metaBadge: {
      backgroundColor: "#0d1117",
      border: "1px solid #21262d",
      borderRadius: "8px",
      padding: "12px 16px",
      textAlign: "center"
    },
    badgeLabel: {
      fontSize: "0.75rem",
      color: "#8b949e",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
      display: "block"
    },
    badgeValue: (color) => ({
      fontSize: "1.1rem",
      fontWeight: "600",
      color: color || "#f0f6fc"
    }),
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    inputWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "0.85rem",
      fontWeight: "500",
      color: "#8b949e",
    },
    input: (fieldName) => ({
      backgroundColor: "#0d1117",
      border: focusedField === fieldName ? "1px solid #58a6ff" : "1px solid #30363d",
      borderRadius: "6px",
      color: "#f0f6fc",
      padding: "12px 16px",
      fontSize: "0.95rem",
      outline: "none",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: focusedField === fieldName ? "0 0 0 3px rgba(88, 166, 255, 0.15)" : "none",
    }),
    button: {
      backgroundColor: isFormUnchanged ? "#21262d" : isBtnActive ? "#2ea043" : isBtnHovered ? "#2c974b" : "#238636",
      color: isFormUnchanged ? "#8b949e" : "#ffffff",
      border: isFormUnchanged ? "1px solid #30363d" : "1px solid rgba(240,246,252,0.1)",
      borderRadius: "6px",
      padding: "14px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: isFormUnchanged ? "not-allowed" : "pointer",
      transition: "all 0.15s ease",
      marginTop: "12px",
      boxShadow: (!isFormUnchanged && isBtnHovered) ? "0 4px 12px rgba(35, 134, 54, 0.3)" : "none",
      transform: (!isFormUnchanged && isBtnActive) ? "scale(0.98)" : "none",
    },
    messageBox: {
      backgroundColor: isSuccess ? "rgba(54, 166, 109, 0.1)" : "rgba(248, 81, 73, 0.1)",
      border: isSuccess ? "1px solid rgba(54, 166, 109, 0.2)" : "1px solid rgba(248, 81, 73, 0.2)",
      borderRadius: "6px",
      padding: "12px",
      color: isSuccess ? "#56d364" : "#ff7b72",
      fontSize: "0.9rem",
      textAlign: "center",
      marginTop: "16px",
    },
    loadingState: {
      backgroundColor: "#0d1117",
      color: "#8b949e",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "monospace",
      fontSize: "1.1rem"
    }
  };

  if (!user) {
    return <div style={styles.loadingState}>[LOADING USER PROFILE TELEMETRY...]</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.heading}>My Profile</h1>

        {/* Dynamic Telemetry Badges */}
        <div style={styles.badgeRow}>
          <div style={styles.metaBadge}>
            <span style={styles.badgeLabel}>Access Level</span>
            <span style={styles.badgeValue("#58a6ff")}>{user.role || "User"}</span>
          </div>
          <div style={styles.metaBadge}>
            <span style={styles.badgeLabel}>Accumulated Points</span>
            <span style={styles.badgeValue("#7ee787")}>{user.points || 0} pts</span>
          </div>
        </div>

        {/* Dynamic Form Setup */}
        <form onSubmit={updateProfile} style={styles.formGroup}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Profile Name</label>
            <input
              type="text"
              value={user.name || ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Name"
              required
              style={styles.input("name")}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField("")}
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label}>Email Endpoint</label>
            <input
              type="email"
              value={user.email || ""}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="Email"
              required
              style={styles.input("email")}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
            />
          </div>

          <button
            type="submit"
            disabled={isFormUnchanged}
            style={styles.button}
            onMouseEnter={() => !isFormUnchanged && setIsBtnHovered(true)}
            onMouseLeave={() => { setIsBtnHovered(false); setIsBtnActive(false); }}
            onMouseDown={() => !isFormUnchanged && setIsBtnActive(true)}
            onMouseUp={() => setIsBtnActive(false)}
          >
            {isFormUnchanged ? "No Changes Detected" : "Commit Profile Changes"}
          </button>
        </form>

        {message && <div style={styles.messageBox}>{message}</div>}
      </div>
    </div>
  );
};

export default Profile;
