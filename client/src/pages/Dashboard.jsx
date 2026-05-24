import { useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("No file uploaded");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("audio", file);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5001/api/transcribe",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.transcript);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message || "Transcription Failed"
      );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>AuraScribe 🎤</h1>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload}>
          Transcribe Audio
        </button>
      </div>
    </div>
  );
};

export default Dashboard;