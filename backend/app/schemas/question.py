from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuestionBase(BaseModel):
    title: str
    slug: str
    difficulty: str = "medium"
    description: Optional[str] = None
    solution_code: Optional[str] = None
    solution_language: str = "python"
    github_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    is_completed: bool = False
    notes: Optional[str] = None
    tags: List[str] = []
    display_order: int = 0


class QuestionCreate(QuestionBase):
    topic_id: int


class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None
    description: Optional[str] = None
    solution_code: Optional[str] = None
    solution_language: Optional[str] = None
    github_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    is_completed: Optional[bool] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    display_order: Optional[int] = None


class QuestionResponse(QuestionBase):
    id: int
    topic_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class QuestionList(BaseModel):
    items: List[QuestionResponse]
    total: int
    page: int
    page_size: int
