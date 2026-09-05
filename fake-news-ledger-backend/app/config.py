from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./data/fake_news_ledger.db"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    blockchain_rpc_url: str = ""
    contract_address: str = ""
    private_key: str = ""
    cors_origins: str = "http://localhost:3000,localhost:3001,localhost:3002,https://fake-news-ledgerbymayank.vercel.app"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
