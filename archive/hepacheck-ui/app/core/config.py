from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "HepaCheck"
    SECRET_KEY: str = "super-secret-key"
    DATABASE_URL: str = "sqlite:///./hepacheck.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()