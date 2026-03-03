# FastAPI + React Progress Dashboard - Setup & Deployment Guide

## 📁 Project Structure

```
app/
├── frontend/          # React + Vite (built to dist/)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/           # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/      # Auth, config, security
│   │   ├── db/        # Database setup
│   │   ├── models/    # SQLAlchemy models
│   │   └── schemas/   # Pydantic schemas
│   ├── requirements.txt
│   └── run.py
├── DEPLOYMENT.md      # Detailed deployment guide
├── render.yaml        # Render deployment config
└── README.md
```

## 🚀 Quick Start (Local Development)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Server runs at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend

```bash
npm install
npm run dev
```

App runs at: `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/progress_tracker
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173"]
```

**Frontend** (`.env`):

```env
VITE_API_URL=http://localhost:8000/api
VITE_BASE_PATH=/
```

Copy from `.env.example` files and update as needed.

## 📦 Build for Production

### Build Frontend

```bash
VITE_BASE_PATH=/myprogress/ npm run build
```

Output: `dist/` folder (deploy to web server)

### Build Backend

```bash
pip install -r backend/requirements-prod.txt
```

## 🌐 Deployment Architecture

### Option 1: Render (Recommended)

**Components:**

- **Frontend Service**: Serves static React build at `/myprogress`
- **API Service**: FastAPI backend at separate domain
- **PostgreSQL Database**: Managed by Render

**Steps:**

1. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Use `render.yaml` for one-click deployment

**URLs:**

- Frontend: `https://kapilraghav.info/myprogress`
- API: `https://myprogress-api.onrender.com/api`

### Option 2: GitHub Pages + Backend as a Service

**Frontend:**

- Static build pushed to GitHub Pages
- Served at `kapilraghav.info/myprogress`

**Backend:**

- Deploy to Render, Vercel, Railway, or Heroku
- Configure CORS for GitHub Pages domain

## 🔐 Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Update `CORS_ORIGINS` in production
- [ ] Change admin password hash
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS on your domain
- [ ] Set `ENVIRONMENT=production`
- [ ] Use strong database passwords
- [ ] Keep dependencies updated

## 📊 Environment Variables by Deployment

### Production (Render)

```env
# Backend
ENVIRONMENT=production
DATABASE_URL=postgresql://[from Render]
SECRET_KEY=[strong random key]
CORS_ORIGINS=["https://kapilraghav.info", "https://kapilraghav.info/myprogress"]
FRONTEND_URL=https://kapilraghav.info/myprogress

# Frontend (in Render settings)
VITE_API_URL=https://myprogress-api.onrender.com/api
VITE_BASE_PATH=/myprogress/
```

### Staging

```env
ENVIRONMENT=staging
DATABASE_URL=postgresql://[staging db]
# ... other variables with staging URLs
```

### Development

```env
ENVIRONMENT=development
CORS_ORIGINS=["*"]  # Allow all for local development
# ... local database and URLs
```

## 🛠️ Key Features Configured

✅ **CORS**: Environment-aware (restricted in production, open in dev)
✅ **Database**: PostgreSQL with SQLAlchemy ORM
✅ **Auth**: JWT-based with bcrypt password hashing
✅ **API**: RESTful FastAPI with OpenAPI docs
✅ **Frontend**: React with TypeScript, Vite, Tailwind CSS
✅ **Subdirectory**: Frontend configured to serve from `/myprogress`
✅ **Static Build**: React built as static files for easy deployment

## 📝 API Endpoints

Base: `{API_BASE_URL}`

- `GET  /health` - Health check
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user
- `GET  /topics` - Get all topics
- `GET  /topics/{slug}` - Get specific topic
- `POST /questions` - Track questions
- `GET  /questions` - Get user's questions
- `GET  /progress` - Get user progress

Full docs: `{API_BASE_URL}/docs` (Swagger UI)

## 🧪 Testing

### Backend

```bash
cd backend
pytest tests/  # (when tests are added)
```

### Frontend

```bash
npm run lint
npm run build  # Check build errors
```

## 📚 Useful Links

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Render Docs](https://render.com/docs)
- [SQLAlchemy Docs](https://www.sqlalchemy.org)

## ❓ Troubleshooting

### CORS Errors

- Check `CORS_ORIGINS` includes your frontend URL
- Verify it's a list: `["https://example.com"]` not just `"https://example.com"`

### API Not Responding

- Check backend is running
- Verify `VITE_API_URL` is correct
- Check network tab in browser DevTools

### Database Connection Failed

- Verify `DATABASE_URL` format
- Ensure database is running
- Check credentials

### Build Failures

- Run `npm install` to ensure dependencies
- Check Node version: `node --version` (need 18+)
- Check Python version: `python --version` (need 3.8+)

## 📞 Support

For issues:

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Review logs in Render Dashboard
3. Check browser console for frontend errors
4. Enable debug mode: `ENVIRONMENT=debug` (backend)

---

Last Updated: March 2026
Version: 1.0.0
