from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import Text
from typing import List, Optional

from ..db.session import get_db
from ..models.question import Question
from ..models.topic import Topic
from ..models.user import User
from ..schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse, QuestionList
from ..core.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get("", response_model=QuestionList)
def get_questions(
    topic_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    is_completed: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get questions with filtering and pagination"""
    query = db.query(Question)

    if topic_id:
        query = query.filter(Question.topic_id == topic_id)

    if difficulty:
        query = query.filter(Question.difficulty == difficulty.lower())

    if is_completed is not None:
        query = query.filter(Question.is_completed == is_completed)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            Question.title.ilike(search_filter) |
            Question.tags.cast(Text).ilike(search_filter)
        )

    total = query.count()
    questions = query.order_by(Question.display_order, Question.id).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return QuestionList(
        items=questions,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific question by ID"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question


@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new question (Admin only)"""
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == question_data.topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )

    # Check if slug already exists
    existing = db.query(Question).filter(Question.slug == question_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question with this slug already exists"
        )

    question = Question(**question_data.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a question (Admin only)"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    update_data = question_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)

    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a question (Admin only)"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    db.delete(question)
    db.commit()
    return None


@router.patch("/{question_id}/toggle-complete", response_model=QuestionResponse)
def toggle_complete(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Toggle the completion status of a question (Admin only)"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    question.is_completed = not question.is_completed
    db.commit()
    db.refresh(question)
    return question
