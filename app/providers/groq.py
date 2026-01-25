from typing import AsyncGenerator
from groq import AsyncGroq
from app.providers.base import BaseProvider, ModelInfo, ChatMessage, ChatResponse
from app.config import get_settings


class GroqProvider(BaseProvider):
    def __init__(self, api_key: str | None = None):
        settings = get_settings()
        # User-provided key takes precedence over env var
        self.api_key = api_key or settings.groq_api_key
        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    def get_available_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="llama-3.3-70b-versatile",
                name="Llama 3.3 70B",
                provider="groq",
                description="Latest Llama, very capable",
            ),
            ModelInfo(
                id="llama-3.1-8b-instant",
                name="Llama 3.1 8B",
                provider="groq",
                description="Fast and lightweight",
            ),
            ModelInfo(
                id="llama3-70b-8192",
                name="Llama 3 70B",
                provider="groq",
                description="Powerful open model",
            ),
            ModelInfo(
                id="gemma2-9b-it",
                name="Gemma 2 9B",
                provider="groq",
                description="Google's open model",
            ),
        ]

    async def chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        if not self.client:
            raise ValueError("Groq API key not configured")

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
            raise ValueError("Groq API key not configured")

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
