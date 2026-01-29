from typing import AsyncGenerator
from google import genai
from google.genai import types
from app.providers.base import BaseProvider, ModelInfo, ChatMessage, ChatResponse
from app.config import get_settings


class GeminiProvider(BaseProvider):
    """Google Gemini provider using the new google-genai SDK."""

    def __init__(self, api_key: str | None = None):
        settings = get_settings()
        self.api_key = api_key or settings.gemini_api_key
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.configured = True
        else:
            self.client = None
            self.configured = False

    def get_available_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="gemini-2.5-flash",
                name="Gemini 2.5 Flash",
                provider="gemini",
                description="Fastest, aligned",
            ),
            ModelInfo(
                id="gemini-2.5-pro",
                name="Gemini 2.5 Pro",
                provider="gemini",
                description="Most capable, aligned",
            ),
            ModelInfo(
                id="gemini-1.5-pro",
                name="Gemini 1.5 Pro",
                provider="gemini",
                description="1M context, aligned",
            ),
            ModelInfo(
                id="gemini-1.5-flash",
                name="Gemini 1.5 Flash",
                provider="gemini",
                description="Fast, aligned",
            ),
        ]

    async def chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        if not self.client:
            raise ValueError("Gemini API key not configured")

        # Build contents list for Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

        # Build config
        config = types.GenerateContentConfig(
            max_output_tokens=4096,
            system_instruction=system_prompt if system_prompt else None,
        )

        response = await self.client.aio.models.generate_content(
            model=model,
            contents=contents,
            config=config,
        )

        # Extract token counts if available
        input_tokens = None
        output_tokens = None
        if hasattr(response, 'usage_metadata') and response.usage_metadata:
            input_tokens = getattr(response.usage_metadata, 'prompt_token_count', None)
            output_tokens = getattr(response.usage_metadata, 'candidates_token_count', None)

        return ChatResponse(
            content=response.text,
            model=model,
            raw_response={"text": response.text},
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )

    async def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        if not self.client:
            raise ValueError("Gemini API key not configured")

        contents = []
        for msg in messages:
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

        config = types.GenerateContentConfig(
            max_output_tokens=4096,
            system_instruction=system_prompt if system_prompt else None,
        )

        async for chunk in self.client.aio.models.generate_content_stream(
            model=model,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                yield chunk.text

    def is_configured(self) -> bool:
        return self.configured
