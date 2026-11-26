from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead], status_code=status.HTTP_200_OK)
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar_activas()


@router.get("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def obtener_categoria(
    id: int = Path(ge=1),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.obtener_por_id(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    datos: CategoriaCreate,
    _: UserPublic = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear(datos)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def actualizar_categoria(
    datos: CategoriaUpdate,
    id: int = Path(ge=1),
    _: UserPublic = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(id, datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int = Path(ge=1),
    _: UserPublic = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
