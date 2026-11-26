from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    datos: UserCreate,
    service: AuthService = Depends(get_auth_service),
):
    try:
        return service.register(datos)
    except UsuarioDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/token", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    try:
        token = service.authenticate_and_create_token(form_data.username, form_data.password)
    except CredencialesInvalidas as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    except CuentaDesactivada as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/", samesite="lax", httponly=True)
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, status_code=status.HTTP_200_OK)
def me(current_user: UserPublic = Depends(get_current_active_user)):
    return current_user
