from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str | None = "Untitled"
    model_a: str
    model_b: str
    system_prompt_a: str | None = None
    system_prompt_b: str | None = None
    starter_message: str


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
    conversation_id: int
    turns: int = 5  # Number of back-and-forth exchanges


class ProviderStatus(BaseModel):
    name: str
    configured: bool
    models: list[dict]
