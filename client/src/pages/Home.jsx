import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          marginBottom: "20px",
        }}
      >
        AuraScribe 🎤
      </h1>

      <p
        style={{
          fontSize: "20px",
          color: "#94a3b8",
          marginBottom: "40px",
        }}
      >
        Premium AI Audio Transcription Platform
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <Link to="/login">
          <button
            style={{
              padding: "14px 40px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            Login
          </button>
        </Link>

        <Link to="/register">
          <button
            style={{
              padding: "14px 40px",
              background: "#0f172a",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;