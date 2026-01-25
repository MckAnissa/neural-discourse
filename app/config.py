from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    groq_api_key: str = ""
    openai_api_key: str = ""
    xai_api_key: str = ""
    together_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./conversations.db"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
