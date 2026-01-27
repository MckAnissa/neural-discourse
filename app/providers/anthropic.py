from typing import AsyncGenerator
import anthropic
from app.providers.base import BaseProvider, ModelInfo, ChatMessage, ChatResponse
from app.config import get_settings


class AnthropicProvider(BaseProvider):
    def __init__(self, api_key: str | None = None):
        settings = get_settings()
        # User-provided key takes precedence over env var
        self.api_key = api_key or settings.anthropic_api_key
        if self.api_key:
            self.client = anthropic.AsyncAnthropic(api_key=self.api_key)
        else:
            self.client = None

    def get_available_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="claude-opus-4-5-20251101",
                name="Claude Opus 4.5",
                provider="anthropic",
                description="Most capable, best for complex tasks",
            ),
            ModelInfo(
                id="claude-sonnet-4-20250514",
                name="Claude Sonnet 4",
                provider="anthropic",
                description="Best balance of speed and capability",
            ),
            ModelInfo(
                id="claude-3-5-haiku-20241022",
                name="Claude 3.5 Haiku",
                provider="anthropic",
                description="Fastest, most cost-effective",
            ),
        ]

    async def chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        if not self.client:
            raise ValueError("Anthropic API key not configured")

        api_messages = [{"role": m.role, "content": m.content} for m in messages]

        kwargs = {
            "model": model,
            "max_tokens": 4096,
            "messages": api_messages,
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self.client.messages.create(**kwargs)

        return ChatResponse(
            content=response.content[0].text,
            model=model,
            raw_response=response.model_dump(),
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
        )

    async def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        if not self.client:
            raise ValueError("Anthropic API key not configured")

        api_messages = [{"role": m.role, "content": m.content} for m in messages]

        kwargs = {
            "model": model,
            "max_tokens": 4096,
            "messages": api_messages,
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        async with self.client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text

    def is_configured(self) -> bool:
        return bool(self.api_key)
