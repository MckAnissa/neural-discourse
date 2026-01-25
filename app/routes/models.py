from fastapi import APIRouter, Request
from app.providers import AnthropicProvider, GroqProvider, OpenAIProvider, XAIProvider
from app.schemas import ProviderStatus

router = APIRouter(prefix="/api/models", tags=["models"])


def get_providers_with_keys(request: Request):
    """Get providers, using user-provided keys from headers if available."""
    anthropic_key = request.headers.get('X-Anthropic-Key')
    groq_key = request.headers.get('X-Groq-Key')
    openai_key = request.headers.get('X-OpenAI-Key')
    xai_key = request.headers.get('X-XAI-Key')

    anthropic_provider = AnthropicProvider(api_key=anthropic_key)
    groq_provider = GroqProvider(api_key=groq_key)
    openai_provider = OpenAIProvider(api_key=openai_key)
    xai_provider = XAIProvider(api_key=xai_key)

    return anthropic_provider, groq_provider, openai_provider, xai_provider


@router.get("/providers", response_model=list[ProviderStatus])
async def get_providers(request: Request):
    """Get all available providers and their status."""
    anthropic_provider, groq_provider, openai_provider, xai_provider = get_providers_with_keys(request)

    return [
        ProviderStatus(
            name="anthropic",
            configured=anthropic_provider.is_configured(),
            models=[
                {"id": m.id, "name": m.name, "description": m.description}
                for m in anthropic_provider.get_available_models()
            ],
        ),
        ProviderStatus(
            name="groq",
            configured=groq_provider.is_configured(),
            models=[
                {"id": m.id, "name": m.name, "description": m.description}
                for m in groq_provider.get_available_models()
            ],
        ),
        ProviderStatus(
            name="openai",
            configured=openai_provider.is_configured(),
            models=[
                {"id": m.id, "name": m.name, "description": m.description}
                for m in openai_provider.get_available_models()
            ],
        ),
        ProviderStatus(
            name="xai",
            configured=xai_provider.is_configured(),
            models=[
                {"id": m.id, "name": m.name, "description": m.description}
                for m in xai_provider.get_available_models()
            ],
        ),
    ]


@router.get("/all")
async def get_all_models(request: Request):
    """Get flat list of all available models."""
    anthropic_provider, groq_provider, openai_provider, xai_provider = get_providers_with_keys(request)
    models = []

    if anthropic_provider.is_configured():
        for m in anthropic_provider.get_available_models():
            models.append({
                "id": m.id,
                "name": m.name,
                "provider": "anthropic",
                "description": m.description,
            })

    if groq_provider.is_configured():
        for m in groq_provider.get_available_models():
            models.append({
                "id": m.id,
                "name": m.name,
                "provider": "groq",
                "description": m.description,
            })

    if openai_provider.is_configured():
        for m in openai_provider.get_available_models():
            models.append({
                "id": m.id,
                "name": m.name,
                "provider": "openai",
                "description": m.description,
            })

    if xai_provider.is_configured():
        for m in xai_provider.get_available_models():
            models.append({
                "id": m.id,
                "name": m.name,
                "provider": "xai",
                "description": m.description,
            })

    return models
