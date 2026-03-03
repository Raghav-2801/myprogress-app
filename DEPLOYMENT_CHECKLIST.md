# Pre-Deployment Checklist

## Backend Setup

- [ ] Update `backend/.env` with production values
  - [ ] Set `SECRET_KEY` to a strong random key
  - [ ] Set production `DATABASE_URL`
  - [ ] Update `CORS_ORIGINS` with production URLs
  - [ ] Set `ENVIRONMENT=production`
- [ ] Verify all dependencies in `backend/requirements.txt`
- [ ] Test backend locally: `python run.py`
- [ ] Check API docs: `http://localhost:8000/docs`

## Frontend Setup

- [ ] Create `.env` file (copy from `.env.example`)
  - [ ] Set `VITE_API_URL` to production API URL
  - [ ] Set `VITE_BASE_PATH=/myprogress/`
- [ ] Test locally: `npm run dev`
- [ ] Build for production: `npm run build`
- [ ] Verify `dist/` folder is created and populated
- [ ] Check built app serves correctly from subdirectory

## Render Deployment

### Phase 1: Create Services

- [ ] Create PostgreSQL database on Render
  - [ ] Note the connection string
  - [ ] Create database user and password
- [ ] Create API web service on Render
  - [ ] Connect GitHub repository
  - [ ] Set build & start commands
  - [ ] Add all environment variables
  - [ ] Note the API service URL (e.g., `myprogress-api.onrender.com`)
- [ ] Create Frontend web service on Render
  - [ ] Connect same GitHub repository
  - [ ] Set build & start commands
  - [ ] Add environment variables with correct API URL
  - [ ] Note the frontend service URL

### Phase 2: Connect Domain

- [ ] Update API service CORS_ORIGINS with frontend URL
- [ ] Restart API service
- [ ] Configure custom domain on Render (kapilraghav.info/myprogress)
- [ ] Update DNS records at domain registrar
- [ ] Wait for DNS propagation (can take 24 hours)

### Phase 3: Testing

- [ ] Test API health check: `{API_URL}/health`
- [ ] Test frontend loads at subdirectory: `kapilraghav.info/myprogress`
- [ ] Test API calls from frontend
- [ ] Test authentication flow
- [ ] Test database connection
- [ ] Check browser console for errors
- [ ] Verify CORS headers are correct

## Post-Deployment

- [ ] Monitor Render dashboard for errors
- [ ] Check logs for any issues
- [ ] Test all API endpoints
- [ ] Test user registration and login
- [ ] Verify data persistence
- [ ] Set up monitoring/alerts (if needed)

## Security Verification

- [ ] HTTPS is enabled
- [ ] CORS is restricted to your domain
- [ ] SECRET_KEY is not hardcoded
- [ ] Database credentials are in environment variables
- [ ] No sensitive data in git repository
- [ ] `.env` files are in `.gitignore`

## Backup & Maintenance

- [ ] Set up database backups on Render
- [ ] Document deployment procedure
- [ ] Save Render service URLs
- [ ] Test recovery procedure

---

## Quick Reference Urls (Fill After Deployment)

| Service  | URL                                       | Status |
| -------- | ----------------------------------------- | ------ |
| Frontend | https://kapilraghav.info/myprogress       | [ ]    |
| API      | https://[name]-api.onrender.com           | [ ]    |
| API Docs | https://[name]-api.onrender.com/docs      | [ ]    |
| Admin    | https://kapilraghav.info/myprogress/admin | [ ]    |

## Environment Variables (For Reference)

### Backend

```
DATABASE_URL=
SECRET_KEY=
ENVIRONMENT=production
CORS_ORIGINS=["https://kapilraghav.info", "https://kapilraghav.info/myprogress"]
FRONTEND_URL=https://kapilraghav.info/myprogress
GITHUB_USERNAME=Raghav-2801
ADMIN_USERNAME=kapil
```

### Frontend

```
VITE_API_URL=
VITE_BASE_PATH=/myprogress/
NODE_VERSION=18.17.0
```

---

**Last reviewed**: March 2026
**Status**: Ready for deployment
