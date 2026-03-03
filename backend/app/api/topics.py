from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..db.session import get_db
from ..models.topic import Topic
from ..models.question import Question
from ..models.user import User
from ..schemas.topic import TopicCreate, TopicUpdate, TopicResponse, TopicWithStats
from ..core.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("", response_model=List[TopicWithStats])
def get_topics(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all topics with progress statistics"""
    query = db.query(Topic)
    
    if category:
        query = query.filter(Topic.category == category)
    
    topics = query.order_by(Topic.display_order).all()
    
    result = []
    for topic in topics:
        total_questions = db.query(Question).filter(Question.topic_id == topic.id).count()
        completed_questions = db.query(Question).filter(
            Question.topic_id == topic.id,
            Question.is_completed == True
        ).count()
        
        progress = (completed_questions / total_questions * 100) if total_questions > 0 else 0
        
        topic_with_stats = TopicWithStats(
            **TopicResponse.model_validate(topic).model_dump(),
            question_count=total_questions,
            completed_count=completed_questions,
            progress_percentage=round(progress, 1)
        )
        result.append(topic_with_stats)
    
    return result


@router.get("/{topic_id}", response_model=TopicResponse)
def get_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific topic by ID"""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic


@router.post("", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new topic (Admin only)"""
    # Check if slug already exists
    existing = db.query(Topic).filter(Topic.slug == topic_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this slug already exists"
        )
    
    topic = Topic(**topic_data.model_dump())
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.put("/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: int,
    topic_data: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a topic (Admin only)"""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    update_data = topic_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(topic, field, value)
    
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a topic (Admin only)"""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    db.delete(topic)
    db.commit()
    return None
