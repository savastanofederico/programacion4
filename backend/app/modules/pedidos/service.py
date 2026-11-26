from datetime import datetime, timezone
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear_pedido(self, usuario_id: int, datos: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            ids_vistos: set[int] = set()
            for item in datos.items:
                if item.producto_id in ids_vistos:
                    raise ProductoRepetido(
                        f"El producto con id {item.producto_id} está repetido en el pedido"
                    )
                ids_vistos.add(item.producto_id)

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega.strip(),
                notas=(datos.notas or "").strip(),
                total=0.0,
            )
            uow.pedidos.add(pedido)
            assert uow.session is not None
            uow.session.flush()
            assert pedido.id is not None

            total_acumulado = 0.0
            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto con id {item.producto_id} no encontrado"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible para la venta"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total_acumulado += subtotal

            pedido.total = round(total_acumulado, 2)
            pedido.updated_at = _utc_now()
            uow.pedidos.add(pedido)
            uow.session.flush()

            pedido_cargado = uow.pedidos.get_with_items(pedido.id)
            assert pedido_cargado is not None
            return PedidoRead.model_validate(pedido_cargado, from_attributes=True)

    def listar_pedidos(
        self,
        usuario_actual: UserPublic,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if usuario_actual.role == "admin" else usuario_actual.id
            total, items = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p, from_attributes=True) for p in items],
            )

    def obtener_por_id(self, pedido_id: int, usuario_actual: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(f"Pedido con id {pedido_id} no encontrado")
            if usuario_actual.role != "admin" and pedido.usuario_id != usuario_actual.id:
                raise PedidoAjeno("No tenés permiso para ver este pedido")
            return PedidoRead.model_validate(pedido, from_attributes=True)

    def cambiar_estado(self, pedido_id: int, datos: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(f"Pedido con id {pedido_id} no encontrado")

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if datos.estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar un pedido de '{pedido.estado}' a '{datos.estado}'"
                )

            if datos.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = datos.estado
            pedido.updated_at = _utc_now()
            uow.pedidos.add(pedido)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(pedido)
            _ = pedido.items
            return PedidoRead.model_validate(pedido, from_attributes=True)

    def cancelar_propio(self, pedido_id: int, usuario_actual: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(f"Pedido con id {pedido_id} no encontrado")
            if pedido.usuario_id != usuario_actual.id:
                raise PedidoAjeno("Solo podés cancelar tus propios pedidos")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    f"Solo se puede cancelar un pedido en estado PENDIENTE (actual: {pedido.estado})"
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = _utc_now()
            uow.pedidos.add(pedido)
            assert uow.session is not None
            uow.session.flush()
            uow.session.refresh(pedido)
            _ = pedido.items
            return PedidoRead.model_validate(pedido, from_attributes=True)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos["PENDIENTE"],
                en_preparacion=conteos["EN_PREPARACION"],
                entregados=conteos["ENTREGADO"],
                cancelados=conteos["CANCELADO"],
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)
