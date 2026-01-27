from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re


class ConversationCreate(BaseModel):
    title: str | None = Field(default="Untitled", max_length=255)
    model_a: str = Field(..., max_length=100)
    model_b: str = Field(..., max_length=100)
    system_prompt_a: str | None = Field(default=None, max_length=10000)
    system_prompt_b: str | None = Field(default=None, max_length=10000)
    starter_message: str = Field(..., min_length=1, max_length=10000)

    @field_validator('title')
    @classmethod
    def sanitize_title(cls, v):
        if v:
            v = re.sub(r'[<>]', '', v)
        return v


class ConversationResponse(BaseModel):
    id: int
    title: str
    model_a: str
    model_b: str
    system_prompt_a: str | None
    system_prompt_b: str | None
    starter_message: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    model_name: str
    content: str
    token_count: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class RunConversationRequest(BaseModel):
    conversation_id: int = Field(..., gt=0)
    turns: int = Field(default=5, ge=1, le=50)  # 1-50 turns allowed


class ProviderStatus(BaseModel):
    name: str
    configured: bool
    models: list[dict]
