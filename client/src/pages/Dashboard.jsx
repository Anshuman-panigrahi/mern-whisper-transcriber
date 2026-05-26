import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("record"); // "record" | "upload"

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);

  // Upload state
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Refs
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();

  // ── Check Auth ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) { /* ignore */ }
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  // ── Format timer ──
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // ── Start Recording ──
  const startRecording = async () => {
    setError(null);
    setTranscript(null);
    setLiveTranscript("");
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);

      // Setup Web Speech API for live transcription
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        let finalText = "";

        recognition.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += text + " ";
            } else {
              interim = text;
            }
          }
          setLiveTranscript(finalText + interim);
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error !== "aborted") {
            // Don't show error for normal stops
          }
        };

        recognition.onend = () => {
          // Auto-restart if still recording
          if (mediaRecorderRef.current?.state === "recording") {
            try { recognition.start(); } catch(e) { /* ignore */ }
          }
        };

        recognition.start();
      }

      // Start timer
      setRecordingTime(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access error:", err);
      if (err.name === "NotAllowedError") {
        setError("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setError("Could not access microphone: " + err.message);
      }
    }
  };

  // ── Stop Recording ──
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) { /* ignore */ }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  // ── Upload recorded audio for server transcription ──
  const transcribeRecording = async () => {
    if (!recordedBlob) return;

    setLoading(true);
    setError(null);

    // If we have live transcript, use it directly
    if (liveTranscript.trim()) {
      setTranscript(liveTranscript.trim());
      setLoading(false);
      return;
    }

    // Otherwise send to server
    try {
      const formData = new FormData();
      formData.append("audio", recordedBlob, "recording.webm");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "https://mern-whisper-transcriber.onrender.com/api/transcribe",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 180000,
        }
      );

      setTranscript(response.data.transcript || response.data.text || "");
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── File Upload Handlers ──
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTranscript(null);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // ── Upload file for transcription ──
  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file first");
      return;
    }

    setLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "https://mern-whisper-transcriber.onrender.com/api/transcribe",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 180000,
        }
      );

      setTranscript(response.data.transcript || response.data.text || "");
      setFile(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared Error Handler ──
  const handleApiError = (error) => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      setError("Session expired. Redirecting to login...");
      localStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 2000);
    } else if (error.response?.status === 400) {
      setError(error.response.data?.message || "Invalid audio file. Please use MP3, WAV, M4A, OGG, or WEBM.");
    } else if (error.response?.status === 500) {
      setError(error.response.data?.message || "Server error. Please check your AssemblyAI API key in the .env file.");
    } else if (error.code === "ERR_NETWORK") {
      setError("Cannot connect to server. Please check your connection and ensure the backend is running.");
    } else if (error.code === "ECONNABORTED") {
      setError("Request timed out. The file might be too large. Try a shorter audio clip.");
    } else {
      setError(`Transcription failed: ${error.message || "Unknown error"}`);
    }
  };

  // ── Actions ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const copyToClipboard = useCallback(() => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transcript]);

  const downloadTranscript = useCallback(() => {
    if (transcript) {
      const blob = new Blob([transcript], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcript.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [transcript]);

  const resetAll = () => {
    setTranscript(null);
    setError(null);
    setFile(null);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setLiveTranscript("");
    setRecordingTime(0);
  };

  return (
    <div className="dashboard-layout">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-icon">🎙️</div>
          <span className="brand-name">AuraScribe</span>
        </div>
        <button className="logout-btn" id="logout-btn" onClick={handleLogout}>
          ↗ Logout
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="dashboard-content">
        <div className="dashboard-title">
          <h1>Transcribe Audio</h1>
          <p>Record your voice or upload a file to get started</p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="tab-switcher">
          <div className={`tab-slider ${activeTab === "record" ? "left" : "right"}`} />
          <button
            className={`tab-btn ${activeTab === "record" ? "active" : ""}`}
            id="tab-record"
            onClick={() => { setActiveTab("record"); resetAll(); }}
          >
            🎤 Record
          </button>
          <button
            className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
            id="tab-upload"
            onClick={() => { setActiveTab("upload"); resetAll(); }}
          >
            📁 Upload
          </button>
        </div>

        {/* ── Glass Card ── */}
        <div className="glass-card">
          {/* ═══ RECORD TAB ═══ */}
          {activeTab === "record" && (
            <div className="record-section">
              <div className="record-visual">
                {isRecording && (
                  <div className="record-rings">
                    <div className="ring" />
                    <div className="ring" />
                    <div className="ring" />
                  </div>
                )}
                <button
                  className={`record-btn ${isRecording ? "recording" : "idle"}`}
                  id="record-btn"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? "⏹" : "🎤"}
                </button>
              </div>

              <div className={`record-status ${isRecording ? "active" : ""}`}>
                {isRecording ? "Recording..." : recordedBlob ? "Recording complete" : "Tap to start recording"}
              </div>

              {(isRecording || recordingTime > 0) && (
                <div className="record-timer">{formatTime(recordingTime)}</div>
              )}

              {!isRecording && !recordedBlob && (
                <p className="record-hint">
                  Click the microphone button to start recording.
                  <br />Your voice will be transcribed in real-time.
                </p>
              )}

              {/* Live Transcript Preview */}
              {(isRecording || liveTranscript) && (
                <div className="live-transcript">
                  <div className="live-transcript-label">
                    {isRecording && <span className="live-dot" />}
                    {isRecording ? "Live Transcript" : "Recorded Transcript"}
                  </div>
                  <p>
                    {liveTranscript || "Listening..."}
                    {isRecording && <span className="cursor-blink" />}
                  </p>
                </div>
              )}

              {/* Recorded Audio Player */}
              {recordedUrl && !isRecording && (
                <div className="audio-player">
                  <audio controls src={recordedUrl} />
                </div>
              )}

              {/* Transcribe Recorded Audio */}
              {recordedBlob && !isRecording && !transcript && (
                <button
                  className="transcribe-btn"
                  id="transcribe-recording-btn"
                  onClick={transcribeRecording}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner" /> Processing...
                    </>
                  ) : (
                    "✨ Get Transcript"
                  )}
                </button>
              )}
            </div>
          )}

          {/* ═══ UPLOAD TAB ═══ */}
          {activeTab === "upload" && (
            <div className="upload-section">
              <div
                className={`upload-area ${dragOver ? "dragover" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <div className="upload-icon-wrapper">📂</div>
                <p>Drag & drop your audio file here</p>
                <small>or click to browse — MP3, WAV, M4A, OGG, WEBM</small>
                <input
                  id="fileInput"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="file-info">
                  <span>
                    🎵 {file.name}
                    <span className="file-size">({formatFileSize(file.size)})</span>
                  </span>
                  <button className="remove-file" id="remove-file-btn" onClick={removeFile}>
                    Remove
                  </button>
                </div>
              )}

              {!transcript && (
                <button
                  className="transcribe-btn"
                  id="transcribe-upload-btn"
                  onClick={handleUpload}
                  disabled={!file || loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner" /> Transcribing...
                    </>
                  ) : (
                    "⚡ Transcribe Audio"
                  )}
                </button>
              )}
            </div>
          )}

          {/* ── Loading State ── */}
          {loading && (
            <div className="processing-indicator">
              <div className="processing-dots">
                <span />
                <span />
                <span />
              </div>
              <p className="processing-text">Analyzing audio with AI...</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* ── Transcript Result ── */}
          {transcript && (
            <div className="transcript-result">
              <div className="transcript-header">
                <h3>✅ Transcript</h3>
              </div>
              <div className="transcript-body">
                <p>{transcript}</p>
              </div>
              <div className="transcript-actions">
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  id="copy-transcript-btn"
                  onClick={copyToClipboard}
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
                <button
                  className="download-btn"
                  id="download-transcript-btn"
                  onClick={downloadTranscript}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;