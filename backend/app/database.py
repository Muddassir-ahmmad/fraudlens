from collections.abc import Generator
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_PATH = Path(__file__).resolve().parents[1] / "data" / "fraudlens.db"
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")

engine_options = {"pool_pre_ping": True}
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def ensure_schema() -> None:
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(transactions)").fetchall()
        }
        if "risk_factors" not in columns:
            connection.exec_driver_sql("ALTER TABLE transactions ADD COLUMN risk_factors JSON")
        connection.exec_driver_sql("UPDATE transactions SET risk_factors = '[]' WHERE risk_factors IS NULL")
        event_columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(investigation_events)").fetchall()
        }
        if event_columns and "investigator" not in event_columns:
            connection.exec_driver_sql(
                "ALTER TABLE investigation_events ADD COLUMN investigator VARCHAR(100) NOT NULL DEFAULT 'Bank Investigator'"
            )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
