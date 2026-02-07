"""
Конфигурация приложения
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Finio API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # JWT settings
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "finio"
    DB_USER: str = "finio_user"
    DB_PASSWORD: str = "finio_password"
    
    # Telegram Bot settings
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_URL: str = ""
    TELEGRAM_ADMIN_IDS: str = ""
    
    @property
    def telegram_admin_ids_list(self) -> List[int]:
        """Преобразует строку TELEGRAM_ADMIN_IDS в список чисел"""
        if not self.TELEGRAM_ADMIN_IDS:
            return []
        try:
            # Если это одно число
            if self.TELEGRAM_ADMIN_IDS.isdigit():
                return [int(self.TELEGRAM_ADMIN_IDS)]
            # Если это список чисел через запятую
            return [int(x.strip()) for x in self.TELEGRAM_ADMIN_IDS.split(',') if x.strip().isdigit()]
        except:
            return []
    
    # CORS settings
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "/var/log/finio/app.log"
    
    @property
    def database_url(self) -> str:
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()