from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.base import engine, Base
from .api import auth_router, topics_router, questions_router, github_sync_router, progress_router
from .core.config import get_settings

# Create database tables
Base.metadata.create_all(bind=engine)


def seed_initial_data():
    """Seed initial topics and questions if DB is empty"""
    from .db.base import SessionLocal
    from .models.topic import Topic
    from .models.question import Question

    db = SessionLocal()
    try:
        existing = db.query(Topic).first()
        if existing:
            print("ℹ️ Database already seeded.")
            return

        print("🌱 Seeding initial data...")

        topics = [
            Topic(
                name="Python",
                slug="python",
                description="Python programming concepts, best practices, and advanced topics",
                category="python",
                icon="terminal",
                color="#3776AB",
                display_order=1
            ),
            Topic(
                name="LeetCode",
                slug="leetcode",
                description="Data Structures and Algorithms - LeetCode problem solutions",
                category="leetcode",
                icon="code",
                color="#FFA116",
                display_order=2
            ),
            Topic(
                name="System Design",
                slug="system-design",
                description="System design concepts, architecture patterns, and scalability",
                category="system-design",
                icon="server",
                color="#10B981",
                display_order=3
            )
        ]

        for topic in topics:
            db.add(topic)
        db.commit()
        print(f"✅ Created {len(topics)} topics!")

        leetcode_topic = db.query(Topic).filter(Topic.slug == "leetcode").first()
        if leetcode_topic:
            sample_questions = [
                Question(
                    topic_id=leetcode_topic.id,
                    title="Two Sum",
                    slug="two-sum",
                    difficulty="easy",
                    description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    solution_language="python",
                    is_completed=True,
                    leetcode_url="https://leetcode.com/problems/two-sum/",
                    tags=["array", "hash-table"]
                ),
                Question(
                    topic_id=leetcode_topic.id,
                    title="Add Two Numbers",
                    slug="add-two-numbers",
                    difficulty="medium",
                    description="You are given two non-empty linked lists representing two non-negative integers.",
                    solution_language="python",
                    is_completed=True,
                    leetcode_url="https://leetcode.com/problems/add-two-numbers/",
                    tags=["linked-list", "math"]
                ),
                Question(
                    topic_id=leetcode_topic.id,
                    title="Longest Substring Without Repeating Characters",
                    slug="longest-substring-without-repeating-characters",
                    difficulty="medium",
                    description="Given a string s, find the length of the longest substring without repeating characters.",
                    solution_language="python",
                    is_completed=False,
                    leetcode_url="https://leetcode.com/problems/longest-substring-without-repeating-characters/",
                    tags=["string", "sliding-window"]
                )
            ]

            for question in sample_questions:
                db.add(question)
            db.commit()
            print(f"✅ Created {len(sample_questions)} sample questions!")

        print("🎉 Database seeding completed!")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting up FastAPI server...")
    seed_initial_data()
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
