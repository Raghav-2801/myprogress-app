from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.base import engine, Base
from .api import auth_router, topics_router, questions_router, github_sync_router, progress_router
from .core.config import get_settings


# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting up FastAPI server...")
    yield
    # Shutdown
    print("🛑 Shutting down FastAPI server...")


app = FastAPI(
    title="Kapil's Progress Tracker API",
    description="A FastAPI-based progress tracking system for LeetCode, Python, and System Design",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(topics_router, prefix="/api")
app.include_router(questions_router, prefix="/api")
app.include_router(github_sync_router, prefix="/api")
app.include_router(progress_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "🐱 Welcome to Kapil's Progress Tracker API!",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "topics": "/api/topics",
            "questions": "/api/questions",
            "github_sync": "/api/github-sync",
            "progress": "/api/progress"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "progress-tracker-api"}
