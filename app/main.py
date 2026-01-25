from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from pathlib import Path

from app.database import init_db
from app.routes import conversations, models


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Neural Discourse",
    description="Multi-model AI conversation framework",
    version="0.1.0",
    lifespan=lifespan,
)

# Mount static files and templates
static_path = Path(__file__).parent / "static"
templates_path = Path(__file__).parent / "templates"

static_path.mkdir(exist_ok=True)
templates_path.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=templates_path)

# Include routers
app.include_router(conversations.router)
app.include_router(models.router)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/health")
async def health():
    return {"status": "operational"}
