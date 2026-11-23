from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class AutoDesactivacionNoPermitida(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar_usuarios(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.list_all_ordered()
            return [UserPublic.model_validate(u, from_attributes=True) for u in usuarios]

    def activar_usuario(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"Usuario con id {usuario_id} no encontrado")
            usuario.disabled = False
            uow.usuarios.add(usuario)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(usuario)
            return UserPublic.model_validate(usuario, from_attributes=True)

    def desactivar_usuario(self, usuario_id: int, admin_actual_id: int) -> UserPublic:
        if usuario_id == admin_actual_id:
            raise AutoDesactivacionNoPermitida("Un administrador no puede desactivarse a sí mismo")
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"Usuario con id {usuario_id} no encontrado")
            usuario.disabled = True
            uow.usuarios.add(usuario)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(usuario)
            return UserPublic.model_validate(usuario, from_attributes=True)