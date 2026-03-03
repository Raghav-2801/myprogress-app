# Deployment Guide for Render

This guide covers deploying your FastAPI + React app to Render.

## Prerequisites

- Render account (https://render.com)
- GitHub repository with your code
- Domain already set up (kapilraghav.info)

## Deployment Steps

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `progress_tracker_db`
   - Database: `progress_tracker`
   - User: `progress_tracker`
   - Region: Choose your preferred region
   - Plan: Free (for testing) or paid for production
4. Create the database and note the connection string

### Step 2: Deploy Backend API

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `myprogress-api`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.app.main:app --bind 0.0.0.0:$PORT`
   - **Plan:** Free or paid
4. Add Environment Variables:
   ```
   DATABASE_URL = [PostgreSQL connection string from Step 1]
   ENVIRONMENT = production
   SECRET_KEY = [Generate a strong random key]
   CORS_ORIGINS = ["https://kapilraghav.info", "https://www.kapilraghav.info", "https://kapilraghav.info/myprogress"]
   FRONTEND_URL = https://kapilraghav.info/myprogress
   GITHUB_USERNAME = Raghav-2801
   ADMIN_USERNAME = kapil
   ```
5. Create the service

### Step 3: Deploy Frontend

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository (same one)
3. Configure:
   - **Name:** `myprogress-frontend`
   - **Environment:** Node 18
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview`
   - **Publish Directory:** `dist`
   - **Plan:** Free or paid
4. Add Environment Variables:
   ```
   VITE_API_URL = https://[your-api-service-name].onrender.com/api
   VITE_BASE_PATH = /myprogress/
   NODE_VERSION = 18.17.0
   ```
5. Create the service

### Step 4: Update API CORS Origins

After getting your frontend and API URLs:

1. Update the API service's `CORS_ORIGINS` environment variable with your actual Render URLs
2. Restart the API service

### Step 5: Add Custom Domain

1. In Render Dashboard, go to your frontend service
2. Go to "Settings" → "Custom Domain"
3. Add: `kapilraghav.info/myprogress`
4. Update your domain registrar DNS settings to point to Render
5. Follow Render's instructions for DNS configuration

## Environment Variables Reference

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=[strong-random-key]
ENVIRONMENT=production
CORS_ORIGINS=["https://kapilraghav.info/myprogress"]
FRONTEND_URL=https://kapilraghav.info/myprogress
```

### Frontend (.env)

```
VITE_API_URL=https://[api-url]/api
VITE_BASE_PATH=/myprogress/
```

## Required Packages

### Backend

Add to `backend/requirements.txt`:

```
gunicorn==21.2.0
```

### Frontend

Already included in `package.json`

## Troubleshooting

### API connection issues

- Check `CORS_ORIGINS` includes your frontend URL
- Verify `VITE_API_URL` points to correct API service
- Check API service logs in Render dashboard

### Database connection errors

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Check database credentials

### Build failures

- Check build logs in Render dashboard
- Ensure all dependencies are listed in requirements.txt and package.json
- Verify environment variables are set

## Monitoring

Monitor your services in Render Dashboard:

- View logs for errors
- Check CPU and memory usage
- Monitor deploy history

## Local Development

For local testing before deployment:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py

# Frontend (new terminal)
npm install
npm run dev
```

Visit `http://localhost:5173`

## Database Migrations

If you update your models, you'll need to handle migrations:

1. Use Alembic for migrations (already set up)
2. Update your API's build or startup command to run migrations
3. Or manage migrations manually through psql

---

For more help, see [Render Documentation](https://render.com/docs)
