#!/usr/bin/env python3
"""
Database initialization script.
Run this to create tables and seed initial data.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.base import engine, Base, SessionLocal
from app.models.topic import Topic
from app.models.question import Question


def init_database():
    """Create all tables"""
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")


def seed_initial_data():
    """Seed initial topics"""
    db = SessionLocal()
    
    try:
        # Check if topics already exist
        existing = db.query(Topic).first()
        if existing:
            print("ℹ️  Database already seeded.")
            return
        
        print("🌱 Seeding initial data...")
        
        # Create initial topics
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
        
        # Create sample questions for LeetCode
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


if __name__ == "__main__":
    init_database()
    seed_initial_data()
    print("\n🚀 Database is ready! You can now start the server with: uvicorn app.main:app --reload")
