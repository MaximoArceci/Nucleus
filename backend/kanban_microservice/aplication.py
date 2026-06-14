from CORS_config import origins, methods, headers
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from .api import router

app = FastAPI(
    title="Kanban API",
    version="0.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=methods,
    allow_headers=headers,
    allow_credentials=True,
    expose_headers=["*"]
)


@app.get("/")
async def root():
    return RedirectResponse(url="/kanban/docs")


app.include_router(router, tags=["Kanban"])
