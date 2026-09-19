import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect, select
from sqlalchemy.orm import Session

# Allow this script to be run directly from the backend directory.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base, DATABASE_PATH
from app.models.entities import Alert, CustomerVerification, InvestigationEvent, InvestigatorNote, Transaction


def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def copy_table(source: Session, target: Session, model: type) -> int:
    source_columns = {column["name"] for column in inspect(source.bind).get_columns(model.__tablename__)}
    target_columns = {column.name for column in model.__table__.columns}
    rows = source.execute(select(model)).mappings().all()
    copied = 0
    primary_key = model.__table__.primary_key.columns.keys()
    key_name = next(iter(primary_key))
    for row in rows:
        values = {key: value for key, value in row.items() if key in source_columns and key in target_columns}
        key_value = values.get(key_name)
        if key_value is not None and target.get(model, key_value) is not None:
            continue
        target.execute(model.__table__.insert().values(**values))
        copied += 1
    return copied


def main() -> None:
    target_url = os.getenv("DATABASE_URL")
    if not target_url or target_url.startswith("sqlite"):
        raise RuntimeError("Set DATABASE_URL to your Supabase PostgreSQL connection string before migrating.")

    source_url = os.getenv(
        "SOURCE_SQLITE_URL",
        f"sqlite:///{Path(DATABASE_PATH).resolve()}",
    )
    source_engine = create_engine(source_url, connect_args={"check_same_thread": False})
    target_engine = create_engine(normalize_database_url(target_url), pool_pre_ping=True)
    Base.metadata.create_all(target_engine)

    models = [Transaction, Alert, CustomerVerification, InvestigationEvent, InvestigatorNote]
    with Session(source_engine) as source, Session(target_engine) as target:
        totals = {model.__tablename__: copy_table(source, target, model) for model in models if inspect(source.bind).has_table(model.__tablename__)}
        target.commit()

    print("Supabase migration complete:")
    for table, count in totals.items():
        print(f"  {table}: {count} rows copied")


if __name__ == "__main__":
    main()
