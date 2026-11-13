
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
        role: role
      });

      login(response.data);

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
      marginBottom: "28px",
      lineHeight: "1.5"
    },

    roleHeading: {
      color: "#c9d1d9",
      fontSize: "0.9rem",
      fontWeight: "600",
      marginBottom: "10px"
    },

    roleContainer: {
      display: "flex",
      gap: "12px",
      marginBottom: "24px"
    },

    roleButton: (selected) => ({
      flex: 1,
      padding: "13px 8px",
      borderRadius: "7px",
      border: selected
        ? "2px solid #2ea043"
        : "1px solid #30363d",
      backgroundColor: selected
        ? "rgba(35,134,54,0.18)"
        : "#0d1117",
      color: selected ? "#3fb950" : "#8b949e",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "0.9rem"
    }),

    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
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

    errorBox: {
      backgroundColor: "rgba(248,81,73,0.1)",
      border: "1px solid rgba(248,81,73,0.2)",
      borderRadius: "6px",
      padding: "12px",
      color: "#ff7b72",
      fontSize: "0.9rem",
      textAlign: "center"
    },

    footerText: {
      fontSize: "0.9rem",
      color: "#8b949e",
      textAlign: "center",
      marginTop: "24px"
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

        <h2 style={styles.heading}>Welcome Back 🌱</h2>

        <p style={styles.subheading}>
          Sign in to continue tracking your environmental impact.
        </p>

        <form onSubmit={handleSubmit} style={styles.formGroup}>

          {/* SELECT LOGIN ROLE */}
          <div>
            <p style={styles.roleHeading}>Choose Login Type</p>

            <div style={styles.roleContainer}>

              <button
                type="button"
                style={styles.roleButton(role === "user")}
                onClick={() => {
                  setRole("user");
                  setMessage("");
                }}
              >
                👤 User Login
              </button>

              <button
                type="button"
                style={styles.roleButton(role === "admin")}
                onClick={() => {
                  setRole("admin");
                  setMessage("");
                }}
              >
                🛡️ Admin Login
              </button>

            </div>
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
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              value={form.email}
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
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={styles.input("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : role === "admin"
                ? "Sign In as Admin"
                : "Sign In as User"}
          </button>

          {/* ERROR MESSAGE */}
          {message && (
            <div style={styles.errorBox}>
              {message}
            </div>
          )}

          {/* REGISTER LINK */}
          <p style={styles.footerText}>
            New user?{" "}
            <Link to="/register" style={styles.link}>
              Create an account
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;
