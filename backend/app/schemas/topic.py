from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TopicBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category: str = "leetcode"
    icon: Optional[str] = None
    color: Optional[str] = None
    display_order: int = 0


class TopicCreate(TopicBase):
    pass


class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    display_order: Optional[int] = None


class TopicResponse(TopicBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    question_count: int = 0
    completed_count: int = 0
    
    class Config:
        from_attributes = True


class TopicWithStats(TopicResponse):
    progress_percentage: float = 0.0
