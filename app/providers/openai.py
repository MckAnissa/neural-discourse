from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.providers.base import BaseProvider, ModelInfo, ChatMessage, ChatResponse
from app.config import get_settings


class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: str | None = None):
        settings = get_settings()
        # User-provided key takes precedence over env var
        self.api_key = api_key or settings.openai_api_key
        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)
        else:
            self.client = None

    def get_available_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="gpt-4o",
                name="GPT-4o",
                provider="openai",
                description="Latest GPT-4, fast and capable",
            ),
            ModelInfo(
                id="gpt-4o-mini",
                name="GPT-4o Mini",
                provider="openai",
                description="Fast and affordable",
            ),
            ModelInfo(
                id="o1",
                name="o1",
                provider="openai",
                description="Advanced reasoning model",
            ),
            ModelInfo(
                id="o1-mini",
                name="o1 Mini",
                provider="openai",
                description="Fast reasoning model",
            ),
        ]

    async def chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        if not self.client:
            raise ValueError("OpenAI API key not configured")

        api_messages = []
        if system_prompt:
            api_messages.append({"role": "system", "content": system_prompt})
        api_messages.extend([{"role": m.role, "content": m.content} for m in messages])

        response = await self.client.chat.completions.create(
            model=model,
            messages=api_messages,
            max_tokens=4096,
        )

        return ChatResponse(
            content=response.choices[0].message.content,
            model=model,
            raw_response=response.model_dump(),
            input_tokens=response.usage.prompt_tokens if response.usage else None,
            output_tokens=response.usage.completion_tokens if response.usage else None,
        )

    async def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        if not self.client:
            raise ValueError("OpenAI API key not configured")

        api_messages = []
        if system_prompt:
            api_messages.append({"role": "system", "content": system_prompt})
        api_messages.extend([{"role": m.role, "content": m.content} for m in messages])

        stream = await self.client.chat.completions.create(
            model=model,
            messages=api_messages,
            max_tokens=4096,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def is_configured(self) -> bool:
        return bool(self.api_key)
