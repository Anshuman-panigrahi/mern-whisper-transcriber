import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "https://mern-whisper-transcriber.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("✅ Login successful! Token saved.");
        setError(null);
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError("Login failed: No token received. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check your connection and try again.");
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || "Invalid email or password");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Sign in to your AuraScribe account</p>

        <form onSubmit={handleLogin} className="form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <button type="submit" id="login-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;