
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // LOGOUT
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Highlight active navigation link
  const getLinkClass = (path) => {
    return location.pathname === path ? "active-link" : "";
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        🌱 Eco Footprint Hub
      </Link>

      {/* NAVIGATION LINKS */}
      <div className="navbar-links">
        <Link to="/" className={getLinkClass("/")}>
          Home
        </Link>

        {user ? (
          <>
            {/* USER LINKS */}
            <Link to="/dashboard" className={getLinkClass("/dashboard")}>
              Dashboard
            </Link>

            <Link to="/calculator" className={getLinkClass("/calculator")}>
              Calculator
            </Link>

            <Link to="/activities" className={getLinkClass("/activities")}>
              Activities
            </Link>

            <Link to="/challenges" className={getLinkClass("/challenges")}>
              Challenges
            </Link>

            <Link to="/leaderboard" className={getLinkClass("/leaderboard")}>
              Leaderboard
            </Link>

            <Link to="/tips" className={getLinkClass("/tips")}>
              Tips
            </Link>

            <Link
              to="/recommendations"
              className={getLinkClass("/recommendations")}
            >
              Recommendations
            </Link>

            <Link to="/badges" className={getLinkClass("/badges")}>
              Badges
            </Link>

            <Link to="/profile" className={getLinkClass("/profile")}>
              Profile
            </Link>

            {/* ADMIN LINKS */}
            {isAdmin && (
              <>
                <Link to="/admin" className={getLinkClass("/admin")}>
                  Admin Panel
                </Link>

                <Link
                  to="/admin/analytics"
                  className={getLinkClass("/admin/analytics")}
                >
                  Analytics
                </Link>

                <Link
                  to="/admin/users"
                  className={getLinkClass("/admin/users")}
                >
                  Manage Users
                </Link>
              </>
            )}

            {/* LOGOUT BUTTON */}
            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* GUEST LINKS */}
            <Link to="/login" className={getLinkClass("/login")}>
              Login
            </Link>

            <Link to="/register" className={getLinkClass("/register")}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
