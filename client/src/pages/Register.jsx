import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "https://mern-whisper-transcriber.onrender.com/api/auth/register",
        {
          username,
          email,
          password,
        }
      );

      setError(null);
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error("Register error:", error);
      if (error.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure backend is running on port 5001.");
      } else if (error.response?.data?.message?.includes("duplicate") || error.response?.data?.message?.includes("already exists")) {
        setError("Email already exists. Please use a different email.");
      } else {
        setError(error.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join AuraScribe</h1>
        <p>Create your account to start transcribing</p>

        <form onSubmit={handleRegister} className="form">
          <div className="form-group">
            <label htmlFor="reg-username">Full Name</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Enter your full name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <button type="submit" id="register-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{" "}
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;