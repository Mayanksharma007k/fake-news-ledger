from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./data/fake_news_ledger.db"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    blockchain_rpc_url: str = ""
    contract_address: str = ""
    private_key: str = ""
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,https://fake-news-ledgerbymayank.vercel.app,https://fake-news-ledgerbymayank-8j5i5vfh4-mayanksharma007k.vercel.app"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
