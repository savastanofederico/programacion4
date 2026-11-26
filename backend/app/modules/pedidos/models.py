from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False, index=True)
    estado: str = Field(default="PENDIENTE", nullable=False, max_length=30)
    forma_pago: str = Field(nullable=False, max_length=30)
    direccion_entrega: str = Field(nullable=False, min_length=5, max_length=200)
    notas: str = Field(default="", nullable=False, max_length=500)
    total: float = Field(default=0.0, ge=0, nullable=False)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False, index=True)
    producto_id: int = Field(foreign_key="producto.id", nullable=False, index=True)
    cantidad: int = Field(ge=1, nullable=False)
    nombre_producto: str = Field(nullable=False, max_length=150)
    precio_unitario: float = Field(ge=0, nullable=False)
    subtotal: float = Field(ge=0, nullable=False)

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
