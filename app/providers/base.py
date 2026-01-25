from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator


@dataclass
class ModelInfo:
    id: str
    name: str
    provider: str
    description: str


@dataclass
class ChatMessage:
    role: str  # "user" or "assistant"
    content: str


@dataclass
class ChatResponse:
    content: str
    model: str
    raw_response: dict
    input_tokens: int | None = None
    output_tokens: int | None = None


class BaseProvider(ABC):
    @abstractmethod
    def get_available_models(self) -> list[ModelInfo]:
        """Return list of available models for this provider."""
        pass

    @abstractmethod
    async def chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        """Send a chat completion request."""
        pass

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream a chat completion response."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if the provider has valid API credentials."""
        pass
