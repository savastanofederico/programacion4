from sqlalchemy import func
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(statement).first()

    def get_active_by_id(self, categoria_id: int) -> Categoria | None:
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.activo == True,
        )
        return self.session.exec(statement).first()

    def list_activas(self) -> list[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo == True)
            .order_by(Categoria.id)
        )
        return list(self.session.exec(statement).all())
