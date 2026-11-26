from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, nullable=False, max_length=50)
    full_name: str = Field(nullable=False, max_length=120)
    email: str = Field(unique=True, index=True, nullable=False, max_length=120)
    hashed_password: str = Field(nullable=False, max_length=255)
    role: str = Field(default="user", nullable=False, max_length=20)
    disabled: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
