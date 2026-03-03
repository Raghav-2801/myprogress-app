# 🚀 Render Deployment - YOUR STEP-BY-STEP GUIDE

Your GitHub repo is ready: https://github.com/Raghav-2801/myprogress-app ✅

Follow these steps **EXACTLY** in order. Each section has screenshots/instructions.

---

## STEP 1: Create PostgreSQL Database (5 minutes)

### 1.1 - Go to Render Dashboard

1. Open: https://dashboard.render.com
2. Sign in (use your GitHub account)
3. You'll see your dashboard

### 1.2 - Create New Database

1. Click **"New +"** button (top right)
2. Select **"PostgreSQL"**

### 1.3 - Configure Database

Fill in with **EXACT** values:

| Field        | Value                                     |
| ------------ | ----------------------------------------- |
| **Name**     | `progress-tracker-db`                     |
| **Database** | `progress_tracker`                        |
| **User**     | `postgres`                                |
| **Password** | (Generated automatically - you'll see it) |
| **Region**   | Choose closest to US (e.g., "Ohio")       |
| **Plan**     | Free (✅ free for testing)                |

Click **"Create Database"**

⏳ Wait 1-2 minutes for it to create...

### 1.4 - Copy Database URL

When ready (green "Available" status):

1. Click on your database
2. Find **"Internal Database URL"** (looks like):
   ```
   postgresql://postgres:XXXXXXXXXXXXX@dpg-xxxxxxx.render.internal/progress_tracker
   ```
3. **Copy and SAVE THIS** - you need it in Step 2

⚠️ **IMPORTANT:** Use the **Internal** URL (not External)

---

## STEP 2: Deploy Backend API (10 minutes)

### 2.1 - Create Web Service

1. Go to Render Dashboard
2. Click **"New +"** → Select **"Web Service"**
3. Choose **"Deploy existing repository from GitHub"**
4. Click **"Connect"** next to your repo: `myprogress-app`
5. Select the `main` branch

### 2.2 - Configure Service Settings

Fill in these exact values:

**General Settings:**
| Field | Value |
|-------|-------|
| **Name** | `myprogress-api` |
| **Environment** | Python 3 |
| **Region** | Ohio (or your choice) |
| **Branch** | main |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.app.main:app --bind 0.0.0.0:$PORT` |
| **Plan** | Free |

### 2.3 - Add Environment Variables

Scroll down to **"Environment"** section

Click **"Add Environment Variable"** for each:

**Variable 1:**

- **Key:** `DATABASE_URL`
- **Value:** (Paste the PostgreSQL URL from Step 1.4)

**Variable 2:**

- **Key:** `SECRET_KEY`
- **Value:** `Raghav2801SecretKey2026ProgressTracker!`

**Variable 3:**

- **Key:** `ENVIRONMENT`
- **Value:** `production`

**Variable 4:**

- **Key:** `CORS_ORIGINS`
- **Value:** `["https://kapilraghav.info"]`

**Variable 5:**

- **Key:** `FRONTEND_URL`
- **Value:** `https://kapilraghav.info/myprogress`

**Variable 6:**

- **Key:** `GITHUB_USERNAME`
- **Value:** `Raghav-2801`

**Variable 7:**

- **Key:** `ADMIN_USERNAME`
- **Value:** `kapil`

### 2.4 - Deploy

Click **"Create Web Service"**

⏳ Wait for build (2-3 minutes)...

### 2.5 - Verify It's Running

✅ You'll see:

- Green "Live" indicator
- Log: "Application startup complete"

### 2.6 - Save Your API URL

Copy your service URL (shown in Render), like:

```
https://myprogress-api.onrender.com
```

💾 **SAVE THIS - you need it in Step 3**

### 2.7 - Test API

Open in browser:

```
https://myprogress-api.onrender.com/health
```

You should see:

```json
{ "status": "healthy", "service": "progress-tracker-api" }
```

✅ **If yes, API is working!**

---

## STEP 3: Deploy Frontend (10 minutes)

### 3.1 - Create Another Web Service

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Choose **"Deploy existing repository"**
4. Select `myprogress-app` repo again
5. Select `main` branch

### 3.2 - Configure Frontend Service

**General Settings:**
| Field | Value |
|-------|-------|
| **Name** | `myprogress-frontend` |
| **Environment** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview` |
| **Publish Directory** | `dist` |
| **Plan** | Free |

### 3.3 - Add Environment Variables

Click **"Add Environment Variable"** for each:

**Variable 1:**

- **Key:** `VITE_API_URL`
- **Value:** `https://myprogress-api.onrender.com/api`
  (Replace with YOUR API URL from Step 2.6)

**Variable 2:**

- **Key:** `VITE_BASE_PATH`
- **Value:** `/myprogress/`

**Variable 3:**

- **Key:** `NODE_VERSION`
- **Value:** `18.17.0`

### 3.4 - Deploy

Click **"Create Web Service"**

⏳ Build frontend (2-3 minutes)...

### 3.5 - Verify Success

✅ Green "Live" status
✅ Log shows build completed

### 3.6 - Get Frontend URL

Copy your frontend service URL, like:

```
https://myprogress-frontend.onrender.com
```

### 3.7 - Test Frontend

Open in browser: `https://myprogress-frontend.onrender.com`

You should see your app! 🎉

---

## STEP 4: Update CORS on Backend (2 minutes)

Now that frontend is deployed, update API to allow it:

### 4.1 - Update Backend CORS

1. Go to `myprogress-api` service
2. Go to **Settings** → **Environment**
3. Edit `CORS_ORIGINS`
4. Change from:
   ```
   ["https://kapilraghav.info"]
   ```
   to:
   ```
   ["https://myprogress-frontend.onrender.com", "https://kapilraghav.info", "https://kapilraghav.info/myprogress"]
   ```
5. Click **"Save"** (service auto-restarts)

### 4.2 - Wait for Restart

1-2 minutes for API to restart with new CORS

### 4.3 - Test Again

Go to `https://myprogress-frontend.onrender.com` - should work now! ✅

---

## STEP 5: Connect Your Domain (15 minutes)

Since you already have `kapilraghav.info`, let's add the subdirectory path.

### 5.1 - Add Custom Domain to Frontend

1. Go to `myprogress-frontend` service
2. Click **"Settings"** in left menu
3. Scroll to **"Custom Domain"**
4. Enter: `kapilraghav.info`
5. Click **"Add"**

### 5.2 - Update DNS Records

Render will show you DNS instructions. You need to update your domain registrar:

1. Go to where you bought `kapilraghav.info` (e.g., GoDaddy, Namecheap, Route53)
2. Find **DNS Settings**
3. Add/Edit CNAME record:
   - **Name:** `@` or leave blank
   - **Target:** (what Render provides, like `cname.onrender.com`)
   - **TTL:** 3600

⏳ DNS takes 5-60 minutes to propagate

### 5.3 - Wait for SSL Certificate

Render automatically creates HTTPS certificate - wait up to 10 minutes

### 5.4 - Test Your Domain

Visit: `https://kapilraghav.info/myprogress`

Should show your app! 🎉

---

## STEP 6: Verify Everything Works (5 minutes)

### 6.1 - Test All URLs

**Copy-paste each in browser:**

1. Frontend: `https://kapilraghav.info/myprogress`
   - Should load your app
2. API Health: `https://myprogress-api.onrender.com/health`
   - Should show: `{"status": "healthy", "service": "progress-tracker-api"}`
3. API Docs: `https://myprogress-api.onrender.com/docs`
   - Should show Swagger UI with all endpoints

### 6.2 - Test Login

1. Open `https://kapilraghav.info/myprogress`
2. Try to login with username: `kapil`
3. Check browser console (F12) for any errors
4. Check Network tab - see API calls

### 6.3 - Check Logs for Errors

If something doesn't work:

**Backend logs:**

1. Go to `myprogress-api` service
2. Click **"Logs"** tab
3. Look for errors

**Frontend logs:**

1. Go to `myprogress-frontend` service
2. Click **"Logs"** tab
3. Look for build errors

---

## ✅ You're Done!

Your app is now live at:

- **Frontend:** https://kapilraghav.info/myprogress
- **API:** https://myprogress-api.onrender.com
- **API Docs:** https://myprogress-api.onrender.com/docs

---

## 🆘 Common Issues & Fixes

### Issue: "Cannot GET /myprogress"

**Solution:**

- Check if frontend is deployed (should show green "Live")
- Wait for domain DNS to propagate (can take 60 minutes)
- Refresh browser (Ctrl+Shift+R to clear cache)

### Issue: CORS errors in console

**Solution:**

- Update `CORS_ORIGINS` on backend with frontend URL
- Restart backend service
- Wait 2 minutes

### Issue: API not responding

**Solution:**

- Test: `https://myprogress-api.onrender.com/health`
- Check backend logs in Render
- Verify `DATABASE_URL` is correct
- Check all environment variables

### Issue: Database connection failed

**Solution:**

- Copy the **Internal** Database URL (not External)
- Check PostgreSQL status is "Available" (green)
- Verify database user/password is correct

### Issue: Build failed

**Solution:**

- Check Render build logs
- Common: missing dependencies
- Try redeploying (click "Manual Deploy")

---

## 📋 Checklist

- [ ] Step 1: PostgreSQL database created (green "Available")
- [ ] Step 2: Backend API deployed (green "Live")
- [ ] Step 2.7: API health check works
- [ ] Step 3: Frontend deployed (green "Live")
- [ ] Step 3.7: Frontend loads in browser
- [ ] Step 4: CORS updated on backend
- [ ] Step 5: Custom domain added and DNS updated
- [ ] Step 6.1: All URLs work
- [ ] Step 6.2: App functions (login, etc.)
- [ ] Step 6.3: No errors in logs

---

## 📞 Need Help?

If any step doesn't work:

1. Check the logs in Render dashboard
2. Verify all environment variables
3. Test each URL individually
4. Look for the specific error message

---

**Last Updated:** March 2026
**Status:** Ready to deploy!
