"""Picnic backend configuration via environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    picnic_username: str = ""
    picnic_password: str = ""
    picnic_country: str = "NL"


settings = Settings()
