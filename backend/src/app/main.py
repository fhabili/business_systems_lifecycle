from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import health, summary, lcr, nsfr, quality, lineage as lineage_route, chat as chat_route

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
)

# Allow the React frontend (running on port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,        prefix="/api/v1", tags=["Health"])
app.include_router(summary.router,       prefix="/api/v1", tags=["Summary"])
app.include_router(lcr.router,           prefix="/api/v1", tags=["LCR"])
app.include_router(nsfr.router,          prefix="/api/v1", tags=["NSFR"])
app.include_router(quality.router,       prefix="/api/v1", tags=["Quality"])
app.include_router(lineage_route.router, prefix="/api/v1", tags=["Lineage"])
app.include_router(chat_route.router,    prefix="/api/v1", tags=["Chat"])


@app.get("/")
async def root():
    return {"message": f"Welcome to the {settings.app_name}"}
