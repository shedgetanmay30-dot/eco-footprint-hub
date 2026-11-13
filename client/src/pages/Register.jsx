
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/register", form);

      setMessage(
        response.data.message || "Registration successful! Please login."
      );

      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.toLowerCase().includes("successful");

  const styles = {
    wrapper: {
      backgroundColor: "#0d1117",
      backgroundImage:
        "radial-gradient(circle at top right, rgba(35,134,54,0.08), transparent 400px), radial-gradient(circle at bottom left, rgba(88,166,255,0.05), transparent 400px)",
      color: "#c9d1d9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    card: {
      backgroundColor: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "12px",
      padding: "40px 36px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 16px 36px rgba(0,0,0,0.4)"
    },

    heading: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#f0f6fc",
      textAlign: "center",
      marginBottom: "8px"
    },

    subheading: {
      fontSize: "0.9rem",
      color: "#8b949e",
      textAlign: "center",
      marginBottom: "24px",
      lineHeight: "1.5"
    },

    userInfo: {
      backgroundColor: "rgba(35,134,54,0.12)",
      border: "1px solid rgba(46,160,67,0.3)",
      borderRadius: "7px",
      padding: "12px",
      color: "#3fb950",
      textAlign: "center",
      fontSize: "0.9rem",
      marginBottom: "22px"
    },

    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "18px"
    },

    inputWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "7px"
    },

    label: {
      fontSize: "0.85rem",
      fontWeight: "500",
      color: "#8b949e"
    },

    input: (fieldName) => ({
      backgroundColor: "#0d1117",
      border:
        focusedField === fieldName
          ? "1px solid #58a6ff"
          : "1px solid #30363d",
      borderRadius: "6px",
      color: "#f0f6fc",
      padding: "12px 16px",
      fontSize: "0.95rem",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      boxShadow:
        focusedField === fieldName
          ? "0 0 0 3px rgba(88,166,255,0.15)"
          : "none"
    }),

    button: {
      backgroundColor: "#238636",
      color: "#ffffff",
      border: "1px solid rgba(240,246,252,0.1)",
      borderRadius: "6px",
      padding: "14px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      marginTop: "8px",
      opacity: loading ? 0.7 : 1
    },

    messageBox: {
      backgroundColor: isSuccess
        ? "rgba(54,166,109,0.1)"
        : "rgba(248,81,73,0.1)",
      border: isSuccess
        ? "1px solid rgba(54,166,109,0.2)"
        : "1px solid rgba(248,81,73,0.2)",
      borderRadius: "6px",
      padding: "12px",
      color: isSuccess ? "#56d364" : "#ff7b72",
      fontSize: "0.9rem",
      textAlign: "center"
    },

    footerText: {
      fontSize: "0.9rem",
      color: "#8b949e",
      textAlign: "center",
      marginTop: "24px",
      marginBottom: "0"
    },

    link: {
      color: "#58a6ff",
      textDecoration: "none",
      fontWeight: "600"
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <h2 style={styles.heading}>Create Account 🌱</h2>

        <p style={styles.subheading}>
          Join Eco Footprint Hub and start tracking your sustainability goals.
        </p>

        <div style={styles.userInfo}>
          👤 Registering as a Normal User
        </div>

        <form onSubmit={handleSubmit} style={styles.formGroup}>

          {/* FULL NAME */}
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name"
              style={styles.input("name")}
              value={form.name}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField("")}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          {/* EMAIL */}
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Email Address</label>

            <input
              type="email"
              placeholder="name@example.com"
              required
              autoComplete="email"
              style={styles.input("email")}
              value={form.email}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Password</label>

            <input
              type="password"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              autoComplete="new-password"
              style={styles.input("password")}
              value={form.password}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register as User"}
          </button>

          {/* MESSAGE */}
          {message && (
            <div style={styles.messageBox}>
              {message}
            </div>
          )}

          {/* LOGIN LINK */}
          <p style={styles.footerText}>
            Already registered?{" "}
            <Link to="/login" style={styles.link}>
              Login Here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Register;
