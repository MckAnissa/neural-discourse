from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import json
import asyncio

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Conversation, Message
from app.schemas import ConversationCreate, ConversationResponse, MessageResponse, RunConversationRequest, UserMessageInject
from app.providers import (
    AnthropicProvider, GroqProvider, OpenAIProvider, XAIProvider,
    KimiProvider, GeminiProvider
)
from app.providers.base import ChatMessage

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def get_provider(
    model_id: str,
    anthropic_key: str | None = None,
    groq_key: str | None = None,
    openai_key: str | None = None,
    xai_key: str | None = None,
    kimi_key: str | None = None,
    gemini_key: str | None = None,
):
    """Get the appropriate provider for a model, with optional user-provided keys."""
    # Create providers with user keys if provided
    anthropic_provider = AnthropicProvider(api_key=anthropic_key)
    groq_provider = GroqProvider(api_key=groq_key)
    openai_provider = OpenAIProvider(api_key=openai_key)
    xai_provider = XAIProvider(api_key=xai_key)
    kimi_provider = KimiProvider(api_key=kimi_key)
    gemini_provider = GeminiProvider(api_key=gemini_key)

    anthropic_models = [m.id for m in anthropic_provider.get_available_models()]
    groq_models = [m.id for m in groq_provider.get_available_models()]
    openai_models = [m.id for m in openai_provider.get_available_models()]
    xai_models = [m.id for m in xai_provider.get_available_models()]
    kimi_models = [m.id for m in kimi_provider.get_available_models()]
    gemini_models = [m.id for m in gemini_provider.get_available_models()]

    if model_id in anthropic_models:
        return anthropic_provider
    elif model_id in groq_models:
        return groq_provider
    elif model_id in openai_models:
        return openai_provider
    elif model_id in xai_models:
        return xai_provider
    elif model_id in kimi_models:
        return kimi_provider
    elif model_id in gemini_models:
        return gemini_provider
    else:
        raise ValueError(f"Unknown model: {model_id}")


@router.get("/", response_model=list[ConversationResponse])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).order_by(Conversation.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ConversationResponse)
@limiter.limit("30/minute")
async def create_conversation(
    request: Request,
    data: ConversationCreate,
    db: AsyncSession = Depends(get_db)
):
    conversation = Conversation(
        title=data.title,
        model_a=data.model_a,
        model_b=data.model_b,
        model_c=data.model_c,
        system_prompt_a=data.system_prompt_a,
        system_prompt_b=data.system_prompt_b,
        system_prompt_c=data.system_prompt_c,
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
@limiter.limit("20/minute")
async def delete_conversation(request: Request, conversation_id: int, db: AsyncSession = Depends(get_db)):
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
@limiter.limit("10/minute")
async def run_conversation(
    conversation_id: int,
    run_request: RunConversationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Run the conversation for N turns, streaming results."""
    # Get user-provided API keys from headers
    anthropic_key = request.headers.get('X-Anthropic-Key')
    groq_key = request.headers.get('X-Groq-Key')
    openai_key = request.headers.get('X-OpenAI-Key')
    xai_key = request.headers.get('X-XAI-Key')
    kimi_key = request.headers.get('X-Kimi-Key')
    gemini_key = request.headers.get('X-Gemini-Key')

    # Load conversation data before entering the generator
    # (db session will close after this function returns)
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Copy data we need for the generator (before session closes)
    conv_id = conversation.id
    model_a = conversation.model_a
    model_b = conversation.model_b
    model_c = conversation.model_c
    system_prompt_a = conversation.system_prompt_a
    system_prompt_b = conversation.system_prompt_b
    system_prompt_c = conversation.system_prompt_c
    starter_message = conversation.starter_message
    existing_messages = [(msg.role, msg.content) for msg in conversation.messages]

    async def generate():
        # Import here to create new session inside generator
        from app.database import async_session

        # Get existing messages or start fresh
        messages_a = []  # Messages from model A's perspective
        messages_b = []  # Messages from model B's perspective
        messages_c = []  # Messages from model C's perspective (if 3-way)

        # Check if this is a 3-way conversation
        is_three_way = model_c is not None

        # Load existing messages from copied data
        for msg_role, msg_content in existing_messages:
            if msg_role == "model_a":
                messages_a.append(ChatMessage(role="assistant", content=msg_content))
                messages_b.append(ChatMessage(role="user", content=msg_content))
                if is_three_way:
                    messages_c.append(ChatMessage(role="user", content=msg_content))
            elif msg_role == "model_b":
                messages_a.append(ChatMessage(role="user", content=msg_content))
                messages_b.append(ChatMessage(role="assistant", content=msg_content))
                if is_three_way:
                    messages_c.append(ChatMessage(role="user", content=msg_content))
            elif msg_role == "model_c":
                messages_a.append(ChatMessage(role="user", content=msg_content))
                messages_b.append(ChatMessage(role="user", content=msg_content))
                messages_c.append(ChatMessage(role="assistant", content=msg_content))

        # If no messages yet, seed with starter
        if not messages_a:
            messages_b.append(ChatMessage(role="user", content=starter_message))
            if is_three_way:
                messages_c.append(ChatMessage(role="user", content=starter_message))

        # Get providers with user-provided keys
        try:
            provider_a = get_provider(model_a, anthropic_key, groq_key, openai_key, xai_key, kimi_key, gemini_key)
        except ValueError as e:
            yield json.dumps({"type": "error", "error": f"Model A error: {str(e)}"}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
            return

        try:
            provider_b = get_provider(model_b, anthropic_key, groq_key, openai_key, xai_key, kimi_key, gemini_key)
        except ValueError as e:
            yield json.dumps({"type": "error", "error": f"Model B error: {str(e)}"}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
            return

        # Get provider C if 3-way conversation
        provider_c = None
        if is_three_way:
            try:
                provider_c = get_provider(model_c, anthropic_key, groq_key, openai_key, xai_key, kimi_key, gemini_key)
            except ValueError as e:
                yield json.dumps({"type": "error", "error": f"Model C error: {str(e)}"}) + "\n"
                yield json.dumps({"type": "done"}) + "\n"
                return

        # Determine who goes next based on last message
        if not existing_messages:
            current_turn = "b"  # B responds to starter message first
        else:
            last_role = existing_messages[-1][0]  # Get role of last message
            if is_three_way:
                # 3-way rotation: a → b → c → a
                if last_role == "model_a":
                    current_turn = "b"
                elif last_role == "model_b":
                    current_turn = "c"
                else:
                    current_turn = "a"
            else:
                # 2-way rotation: a ↔ b
                current_turn = "a" if last_role == "model_b" else "b"

        for turn in range(run_request.turns):
            if current_turn == "b":
                # Model B responds
                provider = provider_b
                current_model = model_b
                system = system_prompt_b
                messages = messages_b
                role = "model_b"
            elif current_turn == "c":
                # Model C responds
                provider = provider_c
                current_model = model_c
                system = system_prompt_c
                messages = messages_c
                role = "model_c"
            else:
                # Model A responds
                provider = provider_a
                current_model = model_a
                system = system_prompt_a
                messages = messages_a
                role = "model_a"

            # Add context note for first turn
            enhanced_system = system
            if turn == 0 and not existing_messages:
                context_note = "Note: The first message in this conversation was written by a human to seed the discussion. All subsequent messages are from AI models engaging in discourse."
                if enhanced_system:
                    enhanced_system = f"{context_note}\n\n{enhanced_system}"
                else:
                    enhanced_system = context_note

            yield json.dumps({"type": "start", "role": role, "model": current_model}) + "\n"

            try:
                response = await provider.chat(messages, current_model, enhanced_system)
                content = response.content
                token_count = (response.input_tokens or 0) + (response.output_tokens or 0)

                # Save to database with new session
                async with async_session() as session:
                    new_message = Message(
                        conversation_id=conv_id,
                        role=role,
                        model_name=current_model,
                        content=content,
                        raw_response=response.raw_response,
                        token_count=token_count,
                    )
                    session.add(new_message)
                    await session.commit()

                # Update message histories
                if role == "model_a":
                    messages_a.append(ChatMessage(role="assistant", content=content))
                    messages_b.append(ChatMessage(role="user", content=content))
                    if is_three_way:
                        messages_c.append(ChatMessage(role="user", content=content))
                elif role == "model_b":
                    messages_b.append(ChatMessage(role="assistant", content=content))
                    messages_a.append(ChatMessage(role="user", content=content))
                    if is_three_way:
                        messages_c.append(ChatMessage(role="user", content=content))
                elif role == "model_c":
                    messages_c.append(ChatMessage(role="assistant", content=content))
                    messages_a.append(ChatMessage(role="user", content=content))
                    messages_b.append(ChatMessage(role="user", content=content))

                yield json.dumps({
                    "type": "message",
                    "role": role,
                    "model": current_model,
                    "content": content,
                    "tokens": token_count,
                }) + "\n"

            except Exception as e:
                yield json.dumps({"type": "error", "error": str(e)}) + "\n"
                break

            # Rotate to next turn
            if is_three_way:
                # 3-way rotation: a → b → c → a
                if current_turn == "a":
                    current_turn = "b"
                elif current_turn == "b":
                    current_turn = "c"
                else:
                    current_turn = "a"
            else:
                # 2-way rotation: a ↔ b
                current_turn = "a" if current_turn == "b" else "b"
            await asyncio.sleep(0.5)  # Small delay between turns

        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@router.post("/{conversation_id}/inject-message")
@limiter.limit("30/minute")
async def inject_user_message(
    conversation_id: int,
    message_data: UserMessageInject,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Inject a user message into the conversation."""
    # Verify conversation exists
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Determine the role for the message
    # user_to_a means the message appears as if model A said it (so model B sees it as user input)
    # user_to_b means the message appears as if model B said it (so model A sees it as user input)
    if message_data.role == "user_to_a":
        role = "model_a"
    else:
        role = "model_b"

    # Create the message
    new_message = Message(
        conversation_id=conversation_id,
        role=role,
        model_name="human",  # Mark as human-injected
        content=message_data.content,
        raw_response={"injected": True},
        token_count=0,
    )

    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)

    return MessageResponse.model_validate(new_message)
