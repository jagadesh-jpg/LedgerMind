from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from pathlib import Path

class Settings(BaseSettings):
    memory_backend: str = Field(default="local", alias="MEMORY_BACKEND")
    hindsight_base_url: str = Field(default="https://api.hindsight.vectorize.io", alias="HINDSIGHT_BASE_URL")
    hindsight_api_key: str | None = Field(default=None, alias="HINDSIGHT_API_KEY")

    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")
    groq_primary_model: str = Field(default="openai/gpt-oss-120b", alias="GROQ_PRIMARY_MODEL")
    groq_fallback_model: str = Field(default="qwen/qwen3-32b", alias="GROQ_FALLBACK_MODEL")

    port: int = Field(default=8000, alias="PORT")
    host: str = Field(default="127.0.0.1", alias="HOST")
    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173", alias="CORS_ORIGINS")
    database_url: str = Field(default="sqlite:///./ledgermind.db", alias="DATABASE_URL")

    model_config = ConfigDict(
        env_file=str(Path(__file__).parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

def mask_secret(secret: str | None) -> str:
    """Never returns raw secrets. Shows empty string or only last 4 characters masked."""
    if not secret:
        return ""
    secret = secret.strip()
    if len(secret) <= 4:
        return "****"
    return f"{'*' * (len(secret) - 4)}{secret[-4:]}"
