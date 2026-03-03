from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    difficulty = Column(String, nullable=False, default="medium")  # easy, medium, hard
    description = Column(Text, nullable=True)
    solution_code = Column(Text, nullable=True)
    solution_language = Column(String, default="python")
    github_url = Column(String, nullable=True)
    leetcode_url = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    topic = relationship("Topic", back_populates="questions")
