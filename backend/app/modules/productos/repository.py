from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_active_by_id(self, producto_id: int) -> Producto | None:
        statement = (
            select(Producto)
            .options(selectinload(Producto.categoria))
            .where(Producto.id == producto_id, Producto.activo == True)
        )
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        base_filter = [Producto.activo == True]

        if search is not None and search.strip():
            patron = f"%{search.strip()}%"
            base_filter.append(col(Producto.nombre).ilike(patron))

        if categoria_id is not None:
            base_filter.append(Producto.categoria_id == categoria_id)

        if disponible is not None:
            base_filter.append(Producto.disponible == disponible)

        count_stmt = select(func.count()).select_from(Producto).where(*base_filter)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Producto)
            .options(selectinload(Producto.categoria))
            .where(*base_filter)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items
