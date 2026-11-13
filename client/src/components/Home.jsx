import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Eco Footprint Hub 🌍</h1>

      <h2>Track Your Carbon Footprint. Protect Our Planet.</h2>

      <p>
        Calculate your carbon emissions, track daily activities,
        participate in eco challenges and earn rewards.
      </p>

      <div className="home-buttons">
        <Link to="/register">
          <button>Get Started</button>
        </Link>

        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;