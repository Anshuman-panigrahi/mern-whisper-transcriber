import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-logo">🎙️</div>
        <h1>AuraScribe</h1>
        <p className="subtitle">
          Transform your voice into text with AI-powered transcription.
          Record live audio or upload files — get instant, accurate results.
        </p>

        <div className="home-features">
          <div className="feature-card">
            <span className="feature-icon">🎤</span>
            <h3>Live Recording</h3>
            <p>Record directly from your microphone with real-time transcription</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📁</span>
            <h3>File Upload</h3>
            <p>Upload MP3, WAV, M4A, OGG files for accurate transcription</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Instant Results</h3>
            <p>Get your transcriptions in seconds with AI accuracy</p>
          </div>
        </div>

        <div className="button-group">
          <Link to="/login">
            <button className="btn-primary" id="home-login-btn">Get Started →</button>
          </Link>
          <Link to="/register">
            <button className="btn-secondary" id="home-register-btn">Create Account</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;