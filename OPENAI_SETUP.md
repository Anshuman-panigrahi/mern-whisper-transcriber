# 🎯 AuraScribe - OpenAI Whisper Setup Guide

## Fixed Issues
✅ Replaced AssemblyAI with **OpenAI Whisper API** (much cheaper & free trial available)
✅ Updated all backend files to use OpenAI instead of AssemblyAI
✅ Fixed "fetch failed" error by proper API configuration

---

## 🚀 Quick Start

### Step 1: Get OpenAI API Key (FREE - $5 free credits!)

1. Go to **https://platform.openai.com/account/billing/overview**
2. Sign up or log in with your account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create new secret key"**
5. Copy your API key (looks like: `sk-...`)
6. **⚠️ Keep it SECRET!** Never commit it to GitHub

### Step 2: Add API Key to .env

Edit `server/.env` file and replace:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-abc123xyz789...
```

### Step 3: Start Your App

**Terminal 1 - Start Backend:**
```bash
cd server
npm install  # If you haven't already
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm install  # If you haven't already
npm run dev
```

### Step 4: Test It!
- Open http://localhost:5173 (or your Vite port)
- Log in with your account
- Upload an audio file (MP3, WAV, M4A, OGG)
- Watch it transcribe! 🎉

---

## 💰 Pricing (Very Affordable!)

**OpenAI Whisper API:**
- **FREE**: $5 free trial credits (enough for ~500 minutes of audio)
- **After credits**: $0.02 per minute of audio
- Much cheaper than AssemblyAI which charges per hour

Example: 1 hour of audio = $1.20 (vs $0.50+ per hour with AssemblyAI)

---

## 🔧 What Changed

### Files Modified:
1. **server/controllers/transcribeController.js** - Now uses OpenAI Whisper API
2. **server/server.js** - Updated to check for OPENAI_API_KEY
3. **server/.env** - Replaced ASSEMBLY_API_KEY with OPENAI_API_KEY
4. **client/src/pages/Dashboard.jsx** - Updated error messages

### Key Benefits:
- ✅ Free trial credits
- ✅ Better accuracy than most competitors
- ✅ Supports 99+ languages
- ✅ Simple integration with existing code
- ✅ No server resources needed (cloud-based)

---

## ❓ Troubleshooting

### Error: "OpenAI API key is not configured"
→ Make sure you added the API key to `server/.env` and restarted the backend server

### Error: "fetch failed" after setting API key
→ Make sure backend is running on port 5001:
```bash
cd server
npm run dev
```

### Error: "Invalid audio file format"
→ Use: MP3, WAV, M4A, or OGG format

### API Key keeps getting rejected
→ Check if key is correct at https://platform.openai.com/account/api-keys
→ Make sure there are no extra spaces in .env file

---

## 📊 Monitor Your Usage

Check API usage and costs at:
**https://platform.openai.com/account/billing/usage**

---

## 🆘 Still Having Issues?

Check the server logs for detailed error messages:
```
npm run dev  # Run in development mode to see logs
```

Look for messages like:
- "Transcribe endpoint called" ✅ API is receiving uploads
- "OpenAI Whisper API error" → Check your API key
- "File deleted" ✅ Upload working properly
