from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="Untitled")
    model_a = Column(String(100))  # e.g., "claude-3-5-sonnet"
    model_b = Column(String(100))  # e.g., "llama-3.1-70b"
    model_c = Column(String(100), nullable=True)  # Optional third model
    system_prompt_a = Column(Text, nullable=True)
    system_prompt_b = Column(Text, nullable=True)
    system_prompt_c = Column(Text, nullable=True)
    starter_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(50))  # "model_a", "model_b", or "model_c"
    model_name = Column(String(100))
    content = Column(Text)
    raw_response = Column(JSON, nullable=True)  # Store full API response for analysis
    token_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
