from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from ..db.session import get_db
from ..models.topic import Topic
from ..models.question import Question
from ..models.user import User
from ..schemas.question import QuestionResponse
from ..services.github import github_service
from ..core.auth import get_current_admin

router = APIRouter(prefix="/github-sync", tags=["GitHub Sync"])


@router.post("/leetcode", response_model=dict)
async def sync_leetcode_solutions(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Sync LeetCode solutions from GitHub repository.
    This will fetch all Python files and create/update questions in the database.
    """
    try:
        # Get or create the LeetCode topic
        leetcode_topic = db.query(Topic).filter(Topic.slug == "leetcode").first()
        if not leetcode_topic:
            leetcode_topic = Topic(
                name="LeetCode",
                slug="leetcode",
                description="Data Structures and Algorithms - LeetCode Solutions",
                category="leetcode",
                icon="code",
                color="#FFA116",
                display_order=1
            )
            db.add(leetcode_topic)
            db.commit()
            db.refresh(leetcode_topic)
        
        # Fetch solutions from GitHub
        solutions = await github_service.get_leetcode_solutions()
        
        created_count = 0
        updated_count = 0
        
        for solution in solutions:
            # Check if question already exists
            existing = db.query(Question).filter(
                Question.slug == solution["slug"]
            ).first()
            
            if existing:
                # Update existing question
                existing.solution_code = solution.get("content", "")
                existing.github_url = solution.get("github_url", "")
                updated_count += 1
            else:
                # Create new question
                question = Question(
                    topic_id=leetcode_topic.id,
                    title=solution["title"],
                    slug=solution["slug"],
                    difficulty="medium",  # Default difficulty
                    solution_code=solution.get("content", ""),
                    solution_language="python",
                    github_url=solution.get("github_url", ""),
                    leetcode_url=f"https://leetcode.com/problems/{solution['slug']}/" if solution.get("problem_number") else None,
                    is_completed=True,
                    tags=[solution.get("category", "")] if solution.get("category") else []
                )
                db.add(question)
                created_count += 1
        
        db.commit()
        await github_service.close()
        
        return {
            "message": "GitHub sync completed successfully",
            "created": created_count,
            "updated": updated_count,
            "total": len(solutions)
        }
        
    except Exception as e:
        await github_service.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync with GitHub: {str(e)}"
        )


@router.get("/leetcode/preview", response_model=dict)
async def preview_leetcode_solutions(
    current_user: User = Depends(get_current_admin)
):
    """Preview LeetCode solutions from GitHub without syncing"""
    try:
        solutions = await github_service.get_leetcode_solutions()
        await github_service.close()
        
        return {
            "count": len(solutions),
            "solutions": [
                {
                    "title": s["title"],
                    "slug": s["slug"],
                    "problem_number": s.get("problem_number"),
                    "filename": s["filename"],
                    "category": s.get("category")
                }
                for s in solutions[:20]  # Preview first 20
            ]
        }
        
    except Exception as e:
        await github_service.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch from GitHub: {str(e)}"
        )
