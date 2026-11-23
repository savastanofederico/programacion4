from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    datos: PedidoCreate,
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear_pedido(current_user.id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("", response_model=PedidosPaginados, status_code=status.HTTP_200_OK)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: str | None = Query(None),
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar_pedidos(current_user, skip=skip, limit=limit, estado=estado)


@router.get("/resumen", response_model=ResumenPedidos, status_code=status.HTTP_200_OK)
def obtener_resumen(
    _: UserPublic = Depends(require_role(("admin",))),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def obtener_pedido(
    id: int = Path(ge=1),
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener_por_id(id, current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.patch("/{id}/estado", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def cambiar_estado_pedido(
    datos: CambioEstado,
    id: int = Path(ge=1),
    _: UserPublic = Depends(require_role(("admin",))),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(id, datos)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{id}/cancelar", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def cancelar_pedido(
    id: int = Path(ge=1),
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar_propio(id, current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc