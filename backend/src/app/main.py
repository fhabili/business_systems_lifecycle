from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import health

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
)

# Allow the React frontend (running on port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["Health"])


@app.get("/")
async def root():
    return {"message": f"Welcome to the {settings.app_name}"}
