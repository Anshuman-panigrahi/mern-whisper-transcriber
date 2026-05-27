import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      await axios.post(
        "https://mern-whisper-transcriber.onrender.com/api/auth/register",
        {
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      navigate("/login");

    } catch (error) {

      console.log(error);

      setError("Cannot connect to server. Please check your connection and try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Join AuraScribe</h1>

        <p>Create your account to start transcribing</p>

        <form onSubmit={handleSubmit} className="form">

          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <button type="submit" id="register-submit-btn">
            Create Account
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