# 🔐 Session Expiration Fix - Complete Guide

## ✅ What Was Fixed

1. **Extended Token Expiration**: Changed from 7 days → **30 days**
2. **Better Error Logging**: Added detailed logs to track auth issues
3. **Improved Error Messages**: Clear feedback when sessions expire
4. **Robust Token Validation**: Better token checking on both client and server
5. **Enhanced Login Flow**: Proper token storage validation

---

## 🚀 Complete Setup (Final Steps)

### Step 1: Verify .env File is Correct

Make sure `server/.env` has:
```
OPENAI_API_KEY=sk-your-actual-key-here
MONGO_URI=mongodb+srv://admin:admin%40123@cluster0.6ff6ube.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=mysecretkey
PORT=5001
NODE_ENV=development
```

✅ **JWT_SECRET should NOT change** - if it changes, all existing tokens become invalid!

---

### Step 2: Restart BOTH Server and Client

**Important**: You MUST restart both servers for the fixes to take effect!

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

### Step 3: Test the Login Flow

1. **Clear browser storage** (optional but recommended):
   - Open Developer Tools (F12)
   - Go to **Application** tab
   - Click **Local Storage** → `http://localhost:5173`
   - Delete any old tokens

2. **Log in with your credentials:**
   - Email: the email you registered with
   - Password: your password

3. **Check browser console** for logs:
   - Should see: `✅ Login successful! Token saved.`

4. **Go to Dashboard and upload an audio file:**
   - Select an MP3, WAV, M4A, or OGG file
   - Should see: `✅ Transcription successful`
   - You should NOT see "Session expired" errors

---

## 🔍 How to Debug if Issues Persist

### Check 1: Verify Server is Running
```bash
# Terminal 1
cd server
npm run dev
```

Expected output:
```
✅ Server running on port 5001
Health check: http://localhost:5001/api/health
```

Test it: Visit `http://localhost:5001/api/health` in browser
- Should show: `{"status":"ok",...}`

### Check 2: Verify Token is Being Saved
1. Open DevTools (F12)
2. Go to **Application** → **Local Storage** → `http://localhost:5173`
3. Look for key: `token`
4. Value should look like: `eyJhbGciOiJIUzI1NiIs...` (long string)

### Check 3: Watch Server Logs During Transcription
When you upload an audio file, your server logs should show:
```
✅ Token verified for user: [user-id]
Starting transcription of: [file-path]
Transcription completed successfully
```

If you see:
```
❌ Token verification failed: jwt malformed
```
→ The token format is wrong

If you see:
```
❌ Token verification failed: jwt expired
```
→ The token has expired (shouldn't happen with 30-day expiration)

---

## ✨ What Each Fix Does

### 1. Token Expiration (7d → 30d)
**File**: `server/controllers/authController.js`
- Tokens now last 30 days instead of 7
- Reduces how often you need to re-login
- You can still use your session much longer

### 2. Improved Auth Middleware
**File**: `server/middleware/authMiddleware.js`
- Now logs which users are verified ✅
- Shows exact error reasons (expired, malformed, etc.)
- Better error messages sent to client

### 3. Better Client Error Handling
**File**: `client/src/pages/Dashboard.jsx` & `client/src/pages/Login.jsx`
- Clears token on 401 errors (prevents stuck sessions)
- Shows emoji indicators for better UX
- More specific error messages

---

## ⚠️ Common Issues & Solutions

### Issue: "Session expired" immediately after login
**Solution**: 
- Make sure `JWT_SECRET` in `.env` hasn't changed
- Restart both server and client
- Clear browser localStorage and log in again

### Issue: Token not being saved in localStorage
**Solution**:
- Check DevTools → Application → Local Storage
- If token isn't there, login didn't complete successfully
- Check the server logs for any errors

### Issue: Server shows "Missing credentials" error
**Solution**:
- You haven't added your OpenAI API key yet
- Get one from: https://platform.openai.com/account/billing/overview
- Add it to `server/.env`: `OPENAI_API_KEY=sk-...`
- Restart server

### Issue: "Cannot connect to server on port 5001"
**Solution**:
- Backend isn't running!
- Run: `cd server && npm run dev`

---

## 📊 Session Duration Info

- **Before**: 7 days (token expires quickly)
- **After**: 30 days (much better!)
- **User Experience**: You can use the app for a month without re-logging in

---

## 🎯 Quick Checklist

Before you start transcribing:
- [ ] Backend running on port 5001 (`npm run dev` in `server/`)
- [ ] Frontend running on port 5173 (`npm run dev` in `client/`)
- [ ] OpenAI API key added to `server/.env`
- [ ] Logged in successfully (check DevTools for token)
- [ ] Token visible in LocalStorage

If all checks pass → **No session expiration issues!** 🎉

---

## 🆘 Still Having Problems?

1. **Check the error message** in the red box on the dashboard
2. **Look at server logs** (Terminal 1 where you ran `npm run dev`)
3. **Check browser console** (F12 → Console tab)
4. Share any error messages from these three places

Most common fixes:
- Restart both servers
- Clear browser storage and log in again
- Check that OpenAI API key is set
