# 🚀 Step-by-Step Deployment Guide to Render

Follow these steps exactly in order. Each phase builds on the previous one.

---

## PHASE 1: Prepare Your Local Setup (5 minutes)

### Step 1.1: Install Gunicorn for Production

```bash
# From the app directory (where package.json is located)
pip install gunicorn
```

### Step 1.2: Create Environment Files

Create `.env` file in root folder (alongside vite.config.ts):

```env
VITE_API_URL=https://myprogress-api.onrender.com/api
VITE_BASE_PATH=/myprogress/
```

Create `backend/.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/progress_tracker
SECRET_KEY=your-secret-key-here-change-this
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173"]
FRONTEND_URL=http://localhost:5173
GITHUB_USERNAME=Raghav-2801
ADMIN_USERNAME=kapil
ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1W
```

### Step 1.3: Test Build Locally

```bash
# Test frontend build
npm run build

# Check if dist folder is created
ls dist/

# Test backend
cd backend
python run.py
# Should show: "Uvicorn running on http://0.0.0.0:8000"
# Go to http://localhost:8000/docs to verify API is working
```

✅ **If both work, continue to Step 1.4**

### Step 1.4: Update .gitignore

Ensure `.env` files are not committed:

```bash
# Check .gitignore exists
cat .gitignore

# Add these lines if not present:
echo ".env" >> .gitignore
echo "backend/.env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo "venv/" >> .gitignore
```

### Step 1.5: Commit Your Code to GitHub

```bash
# Verify you're in the right directory
pwd  # Should show: /Users/raghav/Downloads/SWITCH/My_progress/FastAPI Auth Progress Dashboard/app

git add .
git commit -m "Configure for Render deployment"
git push origin main  # or your main branch
```

✅ **Phase 1 Complete!** Your code is ready and on GitHub.

---

## PHASE 2: Create Database on Render (5 minutes)

### Step 2.1: Go to Render Dashboard

1. Go to https://dashboard.render.com
2. Sign in with GitHub
3. Click "+" → "PostgreSQL"

### Step 2.2: Configure Database

Fill in:

- **Name**: `progress-tracker-db`
- **Database**: `progress_tracker`
- **User**: `postgres`
- **Region**: (Choose closest to you, e.g., "Ohio")
- **Plan**: Free (for testing) / Paid (for production)

Click "Create Database"

### Step 2.3: Copy Connection String

1. Wait for database to create (1-2 minutes)
2. Go to your database details page
3. **Copy the "Internal Database URL"** - looks like:
   ```
   postgresql://postgres:XXXXXXXXXXX@dpg-xxx.render.internal/progress_tracker
   ```
4. **Save this somewhere** - you'll need it in Step 3

⚠️ **Keep this URL secret! Don't share or commit it!**

✅ **Phase 2 Complete!** Database is ready.

---

## PHASE 3: Deploy Backend API (10 minutes)

### Step 3.1: Create Web Service

1. In Render Dashboard, click "+" → "Web Service"
2. Select your GitHub repository
3. Click "Connect" (if needed)

### Step 3.2: Configure Build Settings

Fill in these exact values:

**Name**: `myprogress-api`

**Environment**: Python 3

**Build Command** (copy exactly):

```
pip install -r backend/requirements.txt
```

**Start Command** (copy exactly):

```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.app.main:app --bind 0.0.0.0:$PORT
```

**Plan**: Free (for testing)

### Step 3.3: Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add each of these (click "Add" after each one):

```
Name: DATABASE_URL
Value: [Paste the PostgreSQL URL from Step 2.3]
```

```
Name: SECRET_KEY
Value: generate-a-random-string-like-this-jEk9mNpQrStUvWxYz0A1b2C3d4E5f6
```

```
Name: ENVIRONMENT
Value: production
```

```
Name: CORS_ORIGINS
Value: ["https://kapilraghav.info", "https://kapilraghav.info/myprogress"]
```

```
Name: FRONTEND_URL
Value: https://kapilraghav.info/myprogress
```

```
Name: GITHUB_USERNAME
Value: Raghav-2801
```

```
Name: ADMIN_USERNAME
Value: kapil
```

### Step 3.4: Deploy

Click "Create Web Service"

⏳ Render will start building (takes 2-3 minutes)

**While waiting, you'll see:**

- "Build in progress..."
- Logs will scroll in "Logs" section

### Step 3.5: Wait for Deployment

✅ Success looks like:

- Green "Live" indicator
- Log shows: "Application startup complete"

❌ If it fails:

- Check logs for errors
- Common issues:
  - Missing environment variable
  - Wrong PostgreSQL URL format
  - Missing `gunicorn` in requirements

### Step 3.6: Test Your API

1. Copy your service URL (shown in Render dashboard, like `myprogress-api.onrender.com`)
2. Open in browser:
   ```
   https://myprogress-api.onrender.com/health
   ```
3. You should see:
   ```json
   { "status": "healthy", "service": "progress-tracker-api" }
   ```

### Step 3.7: Save Your API URL

Your API URL is: `https://myprogress-api.onrender.com` (replace with your actual service name)

✅ **Phase 3 Complete!** Backend is live!

---

## PHASE 4: Deploy Frontend (10 minutes)

### Step 4.1: Create Another Web Service

1. Go to Render Dashboard
2. Click "+" → "Web Service"
3. Select your GitHub repository again
4. Click "Connect"

### Step 4.2: Configure Frontend Service

Fill in:

**Name**: `myprogress-frontend`

**Environment**: Node

**Build Command** (copy exactly):

```
npm install && npm run build
```

**Start Command** (copy exactly):

```
npm run preview
```

**Publish Directory**: `dist`

**Plan**: Free

### Step 4.3: Add Environment Variables

Add these (click "Advanced" first):

```
Name: VITE_API_URL
Value: https://myprogress-api.onrender.com/api
```

_(Replace with YOUR actual API URL from Step 3.7)_

```
Name: VITE_BASE_PATH
Value: /myprogress/
```

```
Name: NODE_VERSION
Value: 18.17.0
```

### Step 4.4: Deploy

Click "Create Web Service"

⏳ Building frontend (takes 2-3 minutes)

### Step 4.5: Wait for Success

✅ When complete:

- Green "Live" indicator
- Frontend URL like: `myprogress-frontend.onrender.com`

### Step 4.6: Test Frontend

1. Open the frontend URL from Render dashboard
2. You should see your app loading
3. Check browser console (F12) for any errors

⚠️ **It might not work yet** - because the API CORS needs updating!

### Step 4.7: Update API CORS Settings

Now that you have the frontend URL:

1. Go to `myprogress-api` service in Render
2. Go to "Environment"
3. Edit `CORS_ORIGINS` and update to:
   ```
   ["https://myprogress-frontend.onrender.com", "https://kapilraghav.info", "https://kapilraghav.info/myprogress"]
   ```
4. Save and the service will auto-redeploy

### Step 4.8: Test Again

1. Go back to frontend URL
2. Test the app - should work now!

✅ **Phase 4 Complete!** Frontend is live!

---

## PHASE 5: Connect Your Domain (15 minutes)

### Step 5.1: Add Custom Domain to Frontend

1. Go to `myprogress-frontend` service in Render
2. Click "Settings" in left menu
3. Scroll to "Custom Domain"
4. Add: `kapilraghav.info`

⚠️ **Note**: GitHub Pages normally uses subdomain like `username.github.io/path`
Since you have a custom domain `kapilraghav.info`, Render will set it up differently

### Step 5.2: Get DNS Instructions

1. Render will show you DNS records to add
2. It will look like:
   ```
   Type: CNAME
   Name: www
   Value: [something].render.onrender.com
   ```

### Step 5.3: Update Your Domain Registrar

Where you bought `kapilraghav.info`:

1. Go to DNS settings
2. Add the CNAME record that Render provided
3. Save changes

### Step 5.4: Wait for DNS Propagation

Takes 5-60 minutes (sometimes up to 24 hours)

**Check status**: Open `https://kapilraghav.info` in browser

### Step 5.5: Add Subdirectory Path

Since you want `/myprogress`:

Render has already set it up! The app is served at:

```
https://kapilraghav.info/myprogress
```

✅ **Phase 5 Complete!** Domain is connected!

---

## PHASE 6: Verify Everything (5 minutes)

### Step 6.1: Test All URLs

- [ ] Frontend: https://kapilraghav.info/myprogress (should load)
- [ ] API Health: https://myprogress-api.onrender.com/health (should show status)
- [ ] API Docs: https://myprogress-api.onrender.com/docs (should show Swagger UI)

### Step 6.2: Test Frontend Features

- [ ] App loads
- [ ] Can see login page
- [ ] Check browser console (F12) - no errors?

### Step 6.3: Test API Connection

- [ ] Try to login
- [ ] Check if API calls work
- [ ] Look at Network tab in DevTools

### Step 6.4: Check Logs

If anything doesn't work:

**Backend logs**:

1. Go to `myprogress-api` in Render
2. Click "Logs" - see what's happening

**Frontend logs**:

1. Go to `myprogress-frontend` in Render
2. Click "Logs" - check build logs

---

## Common Issues & Fixes

### ❌ Issue: "Cannot GET /myprogress"

**Fix**: Frontend not deployed or path is wrong

- Check if frontend service shows "Live"
- Verify `VITE_BASE_PATH=/myprogress/`

### ❌ Issue: CORS errors in console

**Fix**: API CORS origins not updated

- Go to `myprogress-api` settings
- Update `CORS_ORIGINS` to include frontend URL
- Wait 30 seconds for restart

### ❌ Issue: Database connection error

**Fix**: Wrong database URL

- Check `DATABASE_URL` environment variable
- Make sure it's the "Internal Database URL" from Render
- Restart API service

### ❌ Issue: API returns 404

**Fix**: Route not found

- Check API is running: `https://[api-url]/health`
- Check your code changes - did you miss something?
- Check logs for specific errors

### ❌ Issue: Build failed

**Check logs** and look for:

- Missing dependencies in `requirements.txt`
- Wrong Python/Node version
- Syntax errors

---

## After Deployment

### Monitoring

- Check Render dashboard daily for errors
- Review logs if something breaks
- Monitor CPU/memory usage

### Updates

To update your app:

1. Make changes locally
2. Test locally
3. Commit and push to GitHub
4. Render auto-redeploys!

### Database Backup

1. In Render, go to your database
2. Click "Data" → "Backups"
3. Enable automatic backups

---

## You're Done! 🎉

Your app is now live at:

- **Frontend**: https://kapilraghav.info/myprogress
- **API**: https://myprogress-api.onrender.com

---

## Quick Reference

| Service  | Status | URL                                 |
| -------- | ------ | ----------------------------------- |
| Frontend | [ ]    | https://kapilraghav.info/myprogress |
| API      | [ ]    | https://myprogress-api.onrender.com |
| Database | [ ]    | Connected                           |
| Domain   | [ ]    | https://kapilraghav.info            |

Fill in as you complete each step!

---

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for more details on any topic.
