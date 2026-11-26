from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    pass


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            username_limpio = datos.username.strip()
            email_limpio = datos.email.strip().lower()

            if uow.usuarios.get_by_username(username_limpio) is not None:
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")

            if uow.usuarios.get_by_email(email_limpio) is not None:
                raise UsuarioDuplicado("El email ya está registrado")

            nuevo = Usuario(
                username=username_limpio,
                full_name=datos.full_name.strip(),
                email=email_limpio,
                hashed_password=hash_password(datos.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(nuevo)
            return UserPublic.model_validate(nuevo, from_attributes=True)

    def authenticate_and_create_token(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas("Usuario o contraseña incorrectos")

            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")

            return create_access_token({"sub": usuario.username, "role": usuario.role})
