from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import json
import asyncio

from app.database import get_db
from app.models import Conversation, Message
from app.schemas import ConversationCreate, ConversationResponse, MessageResponse, RunConversationRequest
from app.providers import AnthropicProvider, GroqProvider, OpenAIProvider, XAIProvider
from app.providers.base import ChatMessage

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def get_provider(
    model_id: str,
    anthropic_key: str | None = None,
    groq_key: str | None = None,
    openai_key: str | None = None,
    xai_key: str | None = None,
):
    """Get the appropriate provider for a model, with optional user-provided keys."""
    # Create providers with user keys if provided
    anthropic_provider = AnthropicProvider(api_key=anthropic_key)
    groq_provider = GroqProvider(api_key=groq_key)
    openai_provider = OpenAIProvider(api_key=openai_key)
    xai_provider = XAIProvider(api_key=xai_key)

    anthropic_models = [m.id for m in anthropic_provider.get_available_models()]
    groq_models = [m.id for m in groq_provider.get_available_models()]
    openai_models = [m.id for m in openai_provider.get_available_models()]
    xai_models = [m.id for m in xai_provider.get_available_models()]

    if model_id in anthropic_models:
        return anthropic_provider
    elif model_id in groq_models:
        return groq_provider
    elif model_id in openai_models:
        return openai_provider
    elif model_id in xai_models:
        return xai_provider
    else:
        raise ValueError(f"Unknown model: {model_id}")


@router.get("/", response_model=list[ConversationResponse])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).order_by(Conversation.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    db: AsyncSession = Depends(get_db)
):
    conversation = Conversation(
        title=data.title,
        model_a=data.model_a,
        model_b=data.model_b,
        system_prompt_a=data.system_prompt_a,
        system_prompt_b=data.system_prompt_b,
        starter_message=data.starter_message,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(conversation_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    return result.scalars().all()


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conversation)
    await db.commit()
    return {"status": "deleted"}


@router.post("/{conversation_id}/run")
async def run_conversation(
    conversation_id: int,
    request: RunConversationRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Run the conversation for N turns, streaming results."""
    # Get user-provided API keys from headers
    anthropic_key = http_request.headers.get('X-Anthropic-Key')
    groq_key = http_request.headers.get('X-Groq-Key')
    openai_key = http_request.headers.get('X-OpenAI-Key')
    xai_key = http_request.headers.get('X-XAI-Key')

    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    async def generate():
        # Get existing messages or start fresh
        messages_a = []  # Messages from model A's perspective
        messages_b = []  # Messages from model B's perspective

        # Load existing messages
        for msg in conversation.messages:
            if msg.role == "model_a":
                messages_a.append(ChatMessage(role="assistant", content=msg.content))
                messages_b.append(ChatMessage(role="user", content=msg.content))
            else:
                messages_a.append(ChatMessage(role="user", content=msg.content))
                messages_b.append(ChatMessage(role="assistant", content=msg.content))

        # If no messages yet, seed with starter
        if not messages_a:
            messages_b.append(ChatMessage(role="user", content=conversation.starter_message))

        # Get providers with user-provided keys
        try:
            provider_a = get_provider(conversation.model_a, anthropic_key, groq_key, openai_key, xai_key)
        except ValueError as e:
            yield json.dumps({"type": "error", "error": f"Model A error: {str(e)}"}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
            return

        try:
            provider_b = get_provider(conversation.model_b, anthropic_key, groq_key, openai_key, xai_key)
        except ValueError as e:
            yield json.dumps({"type": "error", "error": f"Model B error: {str(e)}"}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
            return

        current_turn = "b" if not conversation.messages else "a"

        for turn in range(request.turns):
            if current_turn == "b":
                # Model B responds
                provider = provider_b
                model = conversation.model_b
                system = conversation.system_prompt_b
                messages = messages_b
                role = "model_b"
            else:
                # Model A responds
                provider = provider_a
                model = conversation.model_a
                system = conversation.system_prompt_a
                messages = messages_a
                role = "model_a"

            yield json.dumps({"type": "start", "role": role, "model": model}) + "\n"

            try:
                response = await provider.chat(messages, model, system)
                content = response.content

                # Save to database
                new_message = Message(
                    conversation_id=conversation_id,
                    role=role,
                    model_name=model,
                    content=content,
                    raw_response=response.raw_response,
                    token_count=(response.input_tokens or 0) + (response.output_tokens or 0),
                )
                db.add(new_message)
                await db.commit()

                # Update message histories
                if role == "model_a":
                    messages_a.append(ChatMessage(role="assistant", content=content))
                    messages_b.append(ChatMessage(role="user", content=content))
                else:
                    messages_b.append(ChatMessage(role="assistant", content=content))
                    messages_a.append(ChatMessage(role="user", content=content))

                yield json.dumps({
                    "type": "message",
                    "role": role,
                    "model": model,
                    "content": content,
                    "tokens": new_message.token_count,
                }) + "\n"

            except Exception as e:
                yield json.dumps({"type": "error", "error": str(e)}) + "\n"
                break

            current_turn = "a" if current_turn == "b" else "b"
            await asyncio.sleep(0.5)  # Small delay between turns

        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")
