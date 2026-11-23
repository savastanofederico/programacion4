from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status
from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados, status_code=status.HTTP_200_OK)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categoria_id: int | None = Query(None, ge=1),
    disponible: bool | None = Query(None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def obtener_producto(
    id: int = Path(ge=1),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.obtener_por_id(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    datos: ProductoCreate,
    _: UserPublic = Depends(require_role(("admin",))),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_producto(
    datos: ProductoUpdate,
    id: int = Path(ge=1),
    _: UserPublic = Depends(require_role(("admin",))),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{id}/stock", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_stock(
    datos: ProductoStockUpdate,
    id: int = Path(ge=1),
    _: UserPublic = Depends(require_role(("admin",))),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    id: int = Path(ge=1),
    _: UserPublic = Depends(require_role(("admin",))),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)