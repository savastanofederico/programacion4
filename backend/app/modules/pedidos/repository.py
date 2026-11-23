from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_with_items(self, pedido_id: int) -> Pedido | None:
        statement = (
            select(Pedido)
            .options(selectinload(Pedido.items))  
            .where(Pedido.id == pedido_id)
        )
        return self.session.exec(statement).first()

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None and estado.strip():
            filtros.append(Pedido.estado == estado.strip().upper())

        count_stmt = select(func.count()).select_from(Pedido).where(*filtros)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Pedido)
            .options(selectinload(Pedido.items))  
            .where(*filtros)
            .order_by(Pedido.id.desc())  
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)  
        rows = self.session.exec(stmt).all()
        conteo = {
            "PENDIENTE": 0,
            "EN_PREPARACION": 0,
            "ENTREGADO": 0,
            "CANCELADO": 0,
        }
        for estado, cantidad in rows:
            conteo[str(estado)] = int(cantidad)
        return conteo

    def count_hoy(self) -> int:
        inicio_hoy = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=None
        )
        stmt = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_hoy)
        )
        return int(self.session.exec(stmt).one())

    def sum_ingresos_entregados(self) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == "ENTREGADO"
        )
        return round(float(self.session.exec(stmt).one()), 2)