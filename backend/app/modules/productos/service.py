from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p, from_attributes=True) for p in items],
            )

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(f"Producto con id {producto_id} no encontrado")
            return ProductoRead.model_validate(producto, from_attributes=True)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(datos.categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(f"Categoría con id {datos.categoria_id} no encontrada")

            nuevo = Producto(
                nombre=datos.nombre.strip(),
                descripcion=datos.descripcion.strip(),
                precio_base=round(datos.precio_base, 2),
                imagen_url=datos.imagen_url.strip(),
                stock=datos.stock,
                disponible=datos.disponible,
                categoria_id=datos.categoria_id,
                activo=True,
            )
            uow.productos.add(nuevo)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(nuevo)
            _ = nuevo.categoria
            return ProductoRead.model_validate(nuevo, from_attributes=True)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(f"Producto con id {producto_id} no encontrado")

            cambios = datos.model_dump(exclude_unset=True)
            if "categoria_id" in cambios and cambios["categoria_id"] is not None:
                nueva_cat = uow.categorias.get_active_by_id(cambios["categoria_id"])
                if nueva_cat is None:
                    raise CategoriaNoEncontrada(
                        f"Categoría con id {cambios['categoria_id']} no encontrada"
                    )

            for campo, valor in cambios.items():
                if valor is None:
                    continue
                if campo in ("nombre", "descripcion", "imagen_url") and isinstance(valor, str):
                    valor = valor.strip()
                elif campo == "precio_base":
                    valor = round(float(valor), 2)
                setattr(producto, campo, valor)

            uow.productos.add(producto)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(producto)
            _ = producto.categoria
            return ProductoRead.model_validate(producto, from_attributes=True)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(f"Producto con id {producto_id} no encontrado")

            producto.stock = datos.stock
            producto.disponible = datos.disponible
            uow.productos.add(producto)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(producto)
            _ = producto.categoria
            return ProductoRead.model_validate(producto, from_attributes=True)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(f"Producto con id {producto_id} no encontrado")
            producto.activo = False
            uow.productos.add(producto)
