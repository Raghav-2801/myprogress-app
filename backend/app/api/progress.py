from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db.session import get_db
from ..models.topic import Topic
from ..models.question import Question
from ..models.user import User
from ..core.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/stats")
def get_progress_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overall progress statistics"""
    # Total questions
    total_questions = db.query(Question).count()
    
    # Completed questions
    completed_questions = db.query(Question).filter(Question.is_completed == True).count()
    
    # Questions by difficulty
    difficulty_stats = db.query(
        Question.difficulty,
        func.count(Question.id).label("count")
    ).group_by(Question.difficulty).all()
    
    # Questions by topic
    topic_stats = db.query(
        Topic.name,
        Topic.slug,
        func.count(Question.id).label("total"),
        func.sum(func.cast(Question.is_completed, db.Integer)).label("completed")
    ).outerjoin(Question, Topic.id == Question.topic_id).group_by(Topic.id).all()
    
    # Calculate overall progress
    overall_progress = (completed_questions / total_questions * 100) if total_questions > 0 else 0
    
    return {
        "overall": {
            "total_questions": total_questions,
            "completed_questions": completed_questions,
            "progress_percentage": round(overall_progress, 1)
        },
        "by_difficulty": [
            {"difficulty": d.difficulty, "count": d.count}
            for d in difficulty_stats
        ],
        "by_topic": [
            {
                "topic": t.name,
                "slug": t.slug,
                "total": t.total or 0,
                "completed": int(t.completed or 0),
                "progress": round((int(t.completed or 0) / t.total * 100), 1) if t.total else 0
            }
            for t in topic_stats
        ]
    }


@router.get("/leetcode")
def get_leetcode_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed LeetCode progress"""
    leetcode_topic = db.query(Topic).filter(Topic.slug == "leetcode").first()
    
    if not leetcode_topic:
        return {
            "topic": None,
            "questions": [],
            "stats": {
                "total": 0,
                "completed": 0,
                "progress": 0
            }
        }
    
    questions = db.query(Question).filter(
        Question.topic_id == leetcode_topic.id
    ).order_by(Question.display_order, Question.id).all()
    
    total = len(questions)
    completed = sum(1 for q in questions if q.is_completed)
    progress = (completed / total * 100) if total > 0 else 0
    
    return {
        "topic": {
            "id": leetcode_topic.id,
            "name": leetcode_topic.name,
            "description": leetcode_topic.description,
            "color": leetcode_topic.color
        },
        "questions": questions,
        "stats": {
            "total": total,
            "completed": completed,
            "progress": round(progress, 1)
        }
    }
