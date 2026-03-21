import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig
from dotenv import load_dotenv

import routes

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the shared crawler once so the browser is warm for all requests
    routes.crawler = AsyncWebCrawler(config=BrowserConfig(headless=True))
    await routes.crawler.__aenter__()
    yield
    await routes.crawler.__aexit__(None, None, None)


app = FastAPI(title="LeetCode Companion API", version="1.0.0", lifespan=lifespan)

_cors_raw = os.getenv("CORS_ORIGINS", "*")
_cors_origins = ["*"] if _cors_raw.strip() == "*" else [o.strip() for o in _cors_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
