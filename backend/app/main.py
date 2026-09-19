from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine, ensure_schema
from app.routes import alerts, dashboard, transactions
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="FraudLens API",
    version="1.0.0",
    description="Explainable digital payment fraud detection simulator for bank investigators.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(transactions.customer_router)
app.include_router(alerts.router)
app.include_router(alerts.verification_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "fraudlens"}


@app.get("/")
def root():
    return {
        "service": "FraudLens API",
        "status": "ok",
        "docs": "/docs",
        "health": "/api/health",
    }
