# 🚀 Quick Start Guide - AuraScribe

## ⚡ Installation & Setup

### **Step 1: Start the Backend Server**

```bash
# Open Terminal 1
cd server
npm install
npm run dev
```

**Expected Output:**
```
✓ Server running on port 5001
✓ MongoDB connected successfully
```

⚠️ **If you see MongoDB connection error:**
- Make sure your `.env` file has correct `MONGO_URI`
- Check if MongoDB is running
- Internet connection is needed for MongoDB Atlas

---

### **Step 2: Start the Frontend**

```bash
# Open Terminal 2
cd client
npm install
npm run dev
```

**Expected Output:**
```
✓ Local: http://localhost:5173/
```

---

## 🎯 First Time Usage

### **1. Create Account**
- Open `http://localhost:5173` in browser
- Click **"Create Account"** button
- Fill in:
  - **Full Name**: Any name
  - **Email**: your-email@example.com
  - **Password**: At least 6 characters
  - **Confirm Password**: Must match
- Click **"Create Account"**
- ✅ Should redirect to login page

### **2. Login**
- Enter your email and password
- Click **"Login"**
- ✅ Should redirect to Dashboard

### **3. Transcribe Audio**
- Drag an audio file into the upload area OR click to browse
- Click **"🚀 Transcribe Audio"**
- Wait for processing (30 seconds - 2 minutes depending on file length)
- View your transcript!

---

## 🎨 What's New?

### **Modern Design Features:**
- 🎨 Beautiful purple gradient theme
- ⚡ Smooth animations
- 📱 Fully responsive design
- 🎯 Professional UI/UX
- 🔒 Secure authentication
- ☁️ Cloud-based transcription

### **Improved Functionality:**
- ✅ Drag & drop file upload
- ✅ Real-time loading states
- ✅ Detailed error messages
- ✅ Copy transcript to clipboard
- ✅ Network error detection
- ✅ Session management

---

## 🐛 Troubleshooting

### **"fetch failed" error on upload?**

**Check 1: Is backend running?**
```bash
# Terminal should show port 5001 is running
# Check: http://localhost:5001/api/auth/login gives CORS error (expected)
```

**Check 2: Is token saved?**
- Open Browser DevTools (F12)
- Go to: Application → LocalStorage → http://localhost:5173
- Look for `token` key with JWT value
- If missing, you're not logged in

**Check 3: Is file valid?**
- Must be audio format (MP3, WAV, M4A, OGG)
- File size under 50MB
- Format supported by browser and AssemblyAI

**Check 4: API key configured?**
- Check `.env` file has `ASSEMBLY_API_KEY`
- Value should look like: `0dee7722592045dfabbcdfec716a5371`
- If missing, ask admin for API key

---

## 📋 File Structure

```
mern-whisper-transcriber/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx (Homepage)
│   │   │   ├── Login.jsx (Modern login)
│   │   │   ├── Register.jsx (Modern signup)
│   │   │   └── Dashboard.jsx (Transcription UI)
│   │   ├── App.css (Complete redesign)
│   │   └── index.css (Global styles)
│   └── package.json
│
├── server/
│   ├── controllers/
│   │   ├── authController.js (Login/Register)
│   │   └── transcribeController.js (Transcription)
│   ├── middleware/
│   │   ├── authMiddleware.js (JWT verification)
│   │   └── uploadMiddleware.js (File upload)
│   ├── models/
│   │   └── User.js (Database schema)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transcribeRoutes.js
│   ├── server.js (Express setup)
│   ├── .env (Configuration)
│   └── package.json
│
└── README files with documentation
```

---

## 🔒 Environment Variables

**Frontend:** No env vars needed (runs on http://localhost:5173)

**Backend (.env):**
```
ASSEMBLY_API_KEY=your-api-key-here
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
PORT=5001
```

---

## 🎯 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in (returns JWT token)

### **Transcription**
- `POST /api/transcribe` - Upload and transcribe audio (requires auth token)

---

## ✨ Features Implemented

- ✅ User registration with validation
- ✅ User login with JWT authentication
- ✅ Audio file upload (drag & drop)
- ✅ AI-powered transcription via AssemblyAI
- ✅ Transcript display and copy
- ✅ Responsive mobile design
- ✅ Error handling with user feedback
- ✅ Modern UI with animations
- ✅ Session management
- ✅ Logout functionality

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to server" | Backend not running | Start backend: `npm run dev` in server folder |
| "Invalid token" | Login expired | Log out and log back in |
| "No audio file" | File not selected | Click upload area to select file |
| "Transcription failed" | Invalid audio format | Use MP3, WAV, M4A, or OGG format |
| "MongoDB connection error" | Database offline | Check .env MONGO_URI and internet |
| "API key not found" | ASSEMBLY_API_KEY missing | Add to .env file in server folder |

---

## 💡 Tips

1. **For Testing**: Use short audio files (< 5 minutes) for faster results
2. **Audio Formats**: MP3 works best for web uploads
3. **File Size**: Keep files under 50MB
4. **Session**: Session expires after 7 days (configurable in JWT)
5. **Transcripts**: Copy them immediately; they're not stored in database yet

---

## 🎉 You're All Set!

Your AuraScribe app is ready to use with a beautiful modern design!

**Enjoy transcribing! 🚀**
