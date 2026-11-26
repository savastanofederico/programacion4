from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c, from_attributes=True) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(f"Categoría con id {categoria_id} no encontrada")
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre_limpio = datos.nombre.strip()
            if uow.categorias.get_by_nombre(nombre_limpio) is not None:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nombre_limpio}'")

            nueva = Categoria(
                nombre=nombre_limpio,
                descripcion=datos.descripcion.strip(),
                activo=True,
            )
            uow.categorias.add(nueva)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(nueva)
            return CategoriaRead.model_validate(nueva, from_attributes=True)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(f"Categoría con id {categoria_id} no encontrada")

            cambios = datos.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] is not None:
                nuevo_nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None and existente.id != categoria_id:
                    raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nuevo_nombre}'")
                categoria.nombre = nuevo_nombre

            if "descripcion" in cambios and cambios["descripcion"] is not None:
                categoria.descripcion = cambios["descripcion"].strip()

            uow.categorias.add(categoria)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(f"Categoría con id {categoria_id} no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)
